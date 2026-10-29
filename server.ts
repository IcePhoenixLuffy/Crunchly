import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_MENU,
  INITIAL_ORDERS,
  INITIAL_CANTEEN_STATUS,
  DEMO_STUDENT,
  DEMO_ADMIN,
} from './src/data/initialData';
import { MenuItem, Order, OrderStatus, CanteenStatus, User } from './src/types';
import {
  calculateOrderPricing,
  calculateQueueWaitTime,
  generateTokenCode,
} from './src/utils/orderCalculations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Authoritative Data Store
let menuItems: MenuItem[] = JSON.parse(JSON.stringify(INITIAL_MENU));
let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let canteenStatus: CanteenStatus = JSON.parse(JSON.stringify(INITIAL_CANTEEN_STATUS));
let orderCounter = 104;

// Server-Sent Events (SSE) Client Connections
const sseClients = new Set<Response>();

function broadcastSSE(eventType: string, payload: unknown) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SSE stream endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Middleware to authenticate admin actions
const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const token = req.headers['x-admin-token'] || req.query.admin_token;
  if (token === 'canteen-admin-secret-2026' || token === 'admin-authorized') {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized: Admin privileges required' });
};

// --- AUTHENTICATION ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (role === 'admin' || email === DEMO_ADMIN.email) {
    if (password === 'admin123' || password === 'demo' || !password) {
      return res.json({
        user: DEMO_ADMIN,
        token: 'canteen-admin-secret-2026',
      });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  // Student login
  if (email && email.toLowerCase().includes('student') || email === DEMO_STUDENT.email || !email) {
    const studentUser: User = {
      ...DEMO_STUDENT,
      email: email || DEMO_STUDENT.email,
      name: req.body.name || DEMO_STUDENT.name,
    };
    return res.json({
      user: studentUser,
      token: 'student-session-demo',
    });
  }

  // Generic new student registration/login
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: req.body.name || email.split('@')[0],
    email,
    role: 'student',
    rollNumber: req.body.rollNumber || '22ENG' + Math.floor(1000 + Math.random() * 9000),
    department: req.body.department || 'Undergraduate Studies',
  };

  return res.json({
    user: newUser,
    token: 'student-session-demo',
  });
});

// --- MENU APIS ---
app.get('/api/menu', (req: Request, res: Response) => {
  res.json({ menu: menuItems });
});

app.post('/api/menu', requireAdmin, (req: Request, res: Response) => {
  const { name, description, price, category, imageUrl, isVeg, prepTimeMinutes } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const newItem: MenuItem = {
    id: `m-${Date.now()}`,
    name: String(name).trim(),
    description: String(description || '').trim(),
    price: Number(price),
    category,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isVeg: Boolean(isVeg),
    isAvailable: true,
    prepTimeMinutes: Number(prepTimeMinutes) || 5,
    popular: false,
    recommended: false,
    rating: 5.0,
    ratingCount: 1,
  };

  menuItems.unshift(newItem);
  broadcastSSE('menu_updated', { action: 'create', item: newItem });
  res.status(201).json({ item: newItem });
});

app.put('/api/menu/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  menuItems[index] = {
    ...menuItems[index],
    ...req.body,
    id, // protect id
  };

  broadcastSSE('menu_updated', { action: 'update', item: menuItems[index] });
  res.json({ item: menuItems[index] });
});

app.delete('/api/menu/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const deleted = menuItems.splice(index, 1)[0];
  broadcastSSE('menu_updated', { action: 'delete', itemId: id });
  res.json({ success: true, deleted });
});

// --- ORDERS APIS ---
app.get('/api/orders', (req: Request, res: Response) => {
  const { studentId, status } = req.query;
  let filtered = [...orders];

  if (studentId) {
    filtered = filtered.filter((o) => o.studentId === studentId);
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((o) => o.orderStatus === status);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ orders: filtered });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Recalculate dynamic queue position for active orders
  if (order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PREPARING') {
    const activeAhead = orders.filter((o) => {
      const isAhead = new Date(o.createdAt).getTime() < new Date(order.createdAt).getTime();
      const isActive = o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING';
      return isAhead && isActive;
    }).length;
    order.queuePosition = activeAhead + 1;
  } else {
    order.queuePosition = 0;
  }

  res.json({ order });
});

// Create new order with strict server-side price calculation
app.post('/api/orders', (req: Request, res: Response) => {
  if (!canteenStatus.isOpen || !canteenStatus.acceptingOrders) {
    return res.status(400).json({ error: 'Canteen is currently closed or paused for new orders.' });
  }

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING'
  ).length;

  if (activeOrdersCount >= canteenStatus.maxConcurrentCapacity) {
    return res.status(429).json({
      error: 'Kitchen is currently operating at maximum queue capacity. Please try again in 5-10 minutes.',
    });
  }

  const {
    items,
    studentId,
    studentName,
    studentEmail,
    studentRoll,
    pickupSlot,
    specialInstructions,
    paymentMethod,
  } = req.body;

  try {
    const pricing = calculateOrderPricing(items, menuItems);
    const maxItemPrepTime = Math.max(
      ...pricing.orderItems.map((oi) => {
        const m = menuItems.find((mi) => mi.id === oi.menuItemId);
        return m ? m.prepTimeMinutes : 5;
      })
    );

    const { estimatedWaitMinutes, queuePosition } = calculateQueueWaitTime(
      activeOrdersCount,
      maxItemPrepTime
    );

    const readyDate = new Date(Date.now() + estimatedWaitMinutes * 60 * 1000);
    const readyTimeString = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    orderCounter += 1;
    const pickupToken = generateTokenCode(orderCounter);
    const nowIso = new Date().toISOString();

    const isPaid = paymentMethod === 'cash' ? 'PENDING' : 'PAID';
    const initialStatus: OrderStatus = isPaid === 'PAID' ? 'CONFIRMED' : 'PLACED';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      studentId: studentId || DEMO_STUDENT.id,
      studentName: studentName || DEMO_STUDENT.name,
      studentEmail: studentEmail || DEMO_STUDENT.email,
      studentRoll: studentRoll || DEMO_STUDENT.rollNumber || '22BCE1048',
      items: pricing.orderItems,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      serviceFee: pricing.serviceFee,
      totalAmount: pricing.totalAmount,
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: isPaid,
      orderStatus: initialStatus,
      pickupToken,
      pickupSlot: pickupSlot || 'Immediate (Next 10-15 mins)',
      specialInstructions: specialInstructions ? String(specialInstructions).slice(0, 200) : '',
      estimatedPrepMinutes: estimatedWaitMinutes,
      estimatedReadyTime: readyTimeString,
      queuePosition,
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [
        {
          status: 'PLACED',
          timestamp: nowIso,
          note: 'Order submitted by student',
        },
        ...(isPaid === 'PAID'
          ? [
              {
                status: 'CONFIRMED' as OrderStatus,
                timestamp: nowIso,
                note: `Payment verified via ${paymentMethod.toUpperCase()}`,
              },
            ]
          : []),
      ],
    };

    orders.unshift(newOrder);

    // Update active orders count in canteen status
    canteenStatus.currentActiveOrders = orders.filter(
      (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING'
    ).length;

    broadcastSSE('order_created', { order: newOrder });
    broadcastSSE('queue_updated', { activeOrders: canteenStatus.currentActiveOrders });

    res.status(201).json({ order: newOrder });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to calculate order';
    return res.status(400).json({ error: message });
  }
});

// Update order status (Admin or Demo progression)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses: OrderStatus[] = [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'COLLECTED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();
  order.history.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Order updated to ${status}`,
  });

  if (status === 'COLLECTED' || status === 'CANCELLED') {
    order.queuePosition = 0;
  }

  // Update active count
  canteenStatus.currentActiveOrders = orders.filter(
    (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING'
  ).length;

  broadcastSSE('order_updated', { order });
  broadcastSSE('queue_updated', { activeOrders: canteenStatus.currentActiveOrders });

  res.json({ order });
});

// Simulate / confirm payment
app.post('/api/orders/:id/pay', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentStatus = 'PAID';
  if (order.orderStatus === 'PLACED') {
    order.orderStatus = 'CONFIRMED';
  }
  order.updatedAt = new Date().toISOString();
  order.history.push({
    status: 'CONFIRMED',
    timestamp: new Date().toISOString(),
    note: `Simulated payment processed successfully via ${order.paymentMethod.toUpperCase()}`,
  });

  broadcastSSE('order_updated', { order });
  res.json({ order });
});

// --- CANTEEN STATUS & ANALYTICS ---
app.get('/api/canteen/status', (req: Request, res: Response) => {
  const activeCount = orders.filter(
    (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING'
  ).length;

  canteenStatus.currentActiveOrders = activeCount;
  canteenStatus.averageWaitMinutes = Math.max(5, Math.ceil((activeCount * 3.5) / 2) + 5);

  res.json({ canteenStatus });
});

app.patch('/api/canteen/status', requireAdmin, (req: Request, res: Response) => {
  canteenStatus = {
    ...canteenStatus,
    ...req.body,
  };

  broadcastSSE('canteen_updated', { canteenStatus });
  res.json({ canteenStatus });
});

app.get('/api/analytics', (req: Request, res: Response) => {
  const todayOrders = orders;
  const totalOrders = todayOrders.length;
  const completedOrders = todayOrders.filter((o) => o.orderStatus === 'COLLECTED');
  const activeQueue = todayOrders.filter(
    (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING'
  ).length;

  const totalSales = todayOrders.reduce((sum, o) => {
    return o.paymentStatus === 'PAID' ? sum + o.totalAmount : sum;
  }, 0);

  // Popular items tally
  const dishCounts: Record<string, { count: number; revenue: number }> = {};
  for (const o of todayOrders) {
    for (const it of o.items) {
      if (!dishCounts[it.name]) {
        dishCounts[it.name] = { count: 0, revenue: 0 };
      }
      dishCounts[it.name].count += it.quantity;
      dishCounts[it.name].revenue += it.price * it.quantity;
    }
  }

  const popularDishes = Object.entries(dishCounts)
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hourly volume distribution (sample campus peak breaks: 9am breakfast, 12pm lunch, 4pm snacks)
  const hourlyVolume = [
    { hour: '09:00 AM', count: 18 },
    { hour: '10:30 AM', count: 12 },
    { hour: '12:00 PM', count: 42 },
    { hour: '01:00 PM', count: 68 },
    { hour: '02:00 PM', count: 25 },
    { hour: '04:00 PM', count: 48 },
    { hour: '05:30 PM', count: 22 },
  ];

  res.json({
    totalOrdersToday: totalOrders,
    completedOrdersToday: completedOrders.length,
    activeQueueCount: activeQueue,
    totalSalesToday: totalSales,
    avgPrepTimeMinutes: 7.2,
    popularDishes,
    hourlyVolume,
  });
});

// Reset demo database endpoint for hackathon presentations
app.post('/api/reset-demo', (req: Request, res: Response) => {
  menuItems = JSON.parse(JSON.stringify(INITIAL_MENU));
  orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  canteenStatus = JSON.parse(JSON.stringify(INITIAL_CANTEEN_STATUS));
  orderCounter = 104;

  broadcastSSE('menu_updated', { action: 'reset' });
  broadcastSSE('order_updated', { action: 'reset' });
  broadcastSSE('canteen_updated', { canteenStatus });

  res.json({ success: true, message: 'Munchly demo state reset successfully' });
});

// --- VITE MIDDLEWARE / STATIC ASSETS ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Munchly Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
