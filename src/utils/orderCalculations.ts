import { MenuItem, OrderItem } from '../types';

export interface CalculatedPricing {
  subtotal: number;
  tax: number;
  serviceFee: number;
  totalAmount: number;
  orderItems: OrderItem[];
}

/**
 * Validates and calculates order totals server-side using authoritative menu items.
 * Throws an Error if items are missing, invalid, or out of stock.
 */
export function calculateOrderPricing(
  requestedItems: { menuItemId: string; quantity: number }[],
  menuItems: MenuItem[]
): CalculatedPricing {
  if (!requestedItems || requestedItems.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const menuMap = new Map<string, MenuItem>();
  for (const item of menuItems) {
    menuMap.set(item.id, item);
  }

  let subtotal = 0;
  const orderItems: OrderItem[] = [];

  for (const req of requestedItems) {
    if (!req.menuItemId) {
      throw new Error('Missing menuItemId');
    }
    if (typeof req.quantity !== 'number' || req.quantity <= 0 || !Number.isInteger(req.quantity)) {
      throw new Error('Invalid quantity for item');
    }
    if (req.quantity > 20) {
      throw new Error('Quantity exceeds campus canteen limit of 20 per item');
    }

    const menuItem = menuMap.get(req.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item ${req.menuItemId} not found`);
    }

    if (!menuItem.isAvailable) {
      throw new Error(`Item "${menuItem.name}" is currently sold out`);
    }

    const itemTotal = menuItem.price * req.quantity;
    subtotal += itemTotal;

    orderItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: req.quantity,
      imageUrl: menuItem.imageUrl,
      isVeg: menuItem.isVeg,
    });
  }

  // 5% GST on canteen prepared foods, rounded to nearest rupee
  const tax = Math.round(subtotal * 0.05);
  // Fixed ₹2 campus digital token & order maintenance fee
  const serviceFee = 2;
  const totalAmount = subtotal + tax + serviceFee;

  return {
    subtotal,
    tax,
    serviceFee,
    totalAmount,
    orderItems,
  };
}

/**
 * Computes estimated wait time in minutes based on active orders in the kitchen queue
 * and the specific prep time of the items in this order.
 */
export function calculateQueueWaitTime(
  activePendingOrdersCount: number,
  orderPrepTimeEstimate: number
): { estimatedWaitMinutes: number; queuePosition: number } {
  const queuePosition = activePendingOrdersCount + 1;
  // Canteen has 2 parallel preparation stations.
  // Base wait time is order prep time plus buffered queue overhead.
  const queueDelay = Math.ceil((activePendingOrdersCount * 3.5) / 2);
  const estimatedWaitMinutes = Math.max(5, orderPrepTimeEstimate + queueDelay);

  return {
    estimatedWaitMinutes,
    queuePosition,
  };
}

/**
 * Generates an easily readable pickup token string for display on student screens & canteen counters.
 * Example: CB-101, CB-102
 */
export function generateTokenCode(index: number): string {
  const padded = String(index).padStart(3, '0');
  return `CB-${padded}`;
}

/**
 * Format currency in Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
