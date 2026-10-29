import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MenuItem, Order, CanteenStatus, OrderStatus, FoodCategory } from '../types';

// Map database row to client MenuItem
function mapMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    category: row.category as FoodCategory,
    imageUrl: row.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isVeg: Boolean(row.is_veg),
    isAvailable: Boolean(row.is_available),
    prepTimeMinutes: Number(row.prep_time_minutes) || 5,
    popular: Boolean(row.popular),
    recommended: Boolean(row.recommended),
    calories: row.calories ? Number(row.calories) : undefined,
    rating: row.rating ? Number(row.rating) : 4.8,
    ratingCount: row.rating_count ? Number(row.rating_count) : 100,
  };
}

// Map client MenuItem to database row
function mapMenuItemToRow(item: Partial<MenuItem>): any {
  const row: any = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.name !== undefined) row.name = item.name;
  if (item.description !== undefined) row.description = item.description;
  if (item.price !== undefined) row.price = item.price;
  if (item.category !== undefined) row.category = item.category;
  if (item.imageUrl !== undefined) row.image_url = item.imageUrl;
  if (item.isVeg !== undefined) row.is_veg = item.isVeg;
  if (item.isAvailable !== undefined) row.is_available = item.isAvailable;
  if (item.prepTimeMinutes !== undefined) row.prep_time_minutes = item.prepTimeMinutes;
  if (item.popular !== undefined) row.popular = item.popular;
  if (item.recommended !== undefined) row.recommended = item.recommended;
  if (item.calories !== undefined) row.calories = item.calories;
  row.updated_at = new Date().toISOString();
  return row;
}

// Map database row to client Order
function mapOrder(row: any): Order {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    studentRoll: row.student_roll,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    serviceFee: Number(row.service_fee),
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    pickupToken: row.pickup_token,
    pickupSlot: row.pickup_slot,
    specialInstructions: row.special_instructions || '',
    estimatedPrepMinutes: Number(row.estimated_prep_minutes) || 7,
    estimatedReadyTime: row.estimated_ready_time || '',
    queuePosition: Number(row.queue_position) || 1,
    history: typeof row.history === 'string' ? JSON.parse(row.history) : row.history || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map client Order to database row
function mapOrderToRow(order: Order): any {
  return {
    id: order.id,
    student_id: order.studentId,
    student_name: order.studentName,
    student_email: order.studentEmail,
    student_roll: order.studentRoll,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    service_fee: order.serviceFee,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    pickup_token: order.pickupToken,
    pickup_slot: order.pickupSlot,
    special_instructions: order.specialInstructions,
    estimated_prep_minutes: order.estimatedPrepMinutes,
    estimated_ready_time: order.estimatedReadyTime,
    queue_position: order.queuePosition,
    history: order.history,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

export const SupabaseService = {
  // --- MENU CRUD ---
  async getMenu(): Promise<MenuItem[] | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase getMenu warning:', error.message);
      return null;
    }
    return (data || []).map(mapMenuItem);
  },

  async addMenuItem(item: Omit<MenuItem, 'id' | 'rating' | 'ratingCount'>): Promise<MenuItem | null> {
    if (!isSupabaseConfigured()) return null;
    const id = `m-${Date.now()}`;
    const row = mapMenuItemToRow({ ...item, id });
    row.id = id;
    row.created_at = new Date().toISOString();

    const { data, error } = await supabase.from('menu_items').insert(row).select().single();
    if (error) {
      console.error('Supabase addMenuItem error:', error.message);
      return null;
    }
    return mapMenuItem(data);
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    if (!isSupabaseConfigured()) return null;
    const row = mapMenuItemToRow(updates);

    const { data, error } = await supabase
      .from('menu_items')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateMenuItem error:', error.message);
      return null;
    }
    return mapMenuItem(data);
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteMenuItem error:', error.message);
      return false;
    }
    return true;
  },

  // --- ORDERS CRUD ---
  async getOrders(studentId?: string, status?: string): Promise<Order[] | null> {
    if (!isSupabaseConfigured()) return null;
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    if (status && status !== 'ALL') {
      query = query.eq('order_status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getOrders warning:', error.message);
      return null;
    }
    return (data || []).map(mapOrder);
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapOrder(data);
  },

  async createOrder(order: Order): Promise<Order | null> {
    if (!isSupabaseConfigured()) return null;
    const row = mapOrderToRow(order);
    const { data, error } = await supabase.from('orders').insert(row).select().single();
    if (error) {
      console.error('Supabase createOrder error:', error.message);
      return null;
    }
    return mapOrder(data);
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    history: any[]
  ): Promise<Order | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('orders')
      .update({
        order_status: status,
        history: history,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateOrderStatus error:', error.message);
      return null;
    }
    return mapOrder(data);
  },

  // --- CANTEEN STATUS ---
  async getCanteenStatus(): Promise<CanteenStatus | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('canteen_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error || !data) return null;
    return {
      isOpen: data.is_open,
      acceptingOrders: data.accepting_orders,
      maxConcurrentCapacity: data.max_concurrent_capacity,
      currentActiveOrders: data.current_active_orders,
      averageWaitMinutes: data.average_wait_minutes,
      message: data.message,
    };
  },

  async updateCanteenStatus(updates: Partial<CanteenStatus>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.isOpen !== undefined) row.is_open = updates.isOpen;
    if (updates.acceptingOrders !== undefined) row.accepting_orders = updates.acceptingOrders;
    if (updates.maxConcurrentCapacity !== undefined) row.max_concurrent_capacity = updates.maxConcurrentCapacity;
    if (updates.currentActiveOrders !== undefined) row.current_active_orders = updates.currentActiveOrders;
    if (updates.averageWaitMinutes !== undefined) row.average_wait_minutes = updates.averageWaitMinutes;
    if (updates.message !== undefined) row.message = updates.message;

    const { error } = await supabase.from('canteen_settings').update(row).eq('id', 'main');
    return !error;
  },

  // --- REAL-TIME SUBSCRIPTIONS ---
  subscribeToOrders(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return null;
    return supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onUpdate)
      .subscribe();
  },

  subscribeToMenu(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return null;
    return supabase
      .channel('public:menu_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, onUpdate)
      .subscribe();
  },
};
