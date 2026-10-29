export type FoodCategory = 'Breakfast' | 'Meals' | 'Snacks' | 'Beverages' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  popular?: boolean;
  recommended?: boolean;
  calories?: number;
  rating?: number;
  ratingCount?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  isVeg: boolean;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COLLECTED'
  | 'CANCELLED';

export type PaymentMethod = 'upi' | 'qr' | 'card' | 'cash';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderHistoryStep {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupToken: string;
  pickupSlot: string;
  specialInstructions?: string;
  estimatedPrepMinutes: number;
  estimatedReadyTime: string;
  queuePosition: number;
  createdAt: string;
  updatedAt: string;
  history: OrderHistoryStep[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  rollNumber?: string;
  department?: string;
  phone?: string;
}

export interface CanteenStatus {
  isOpen: boolean;
  acceptingOrders: boolean;
  maxConcurrentCapacity: number;
  currentActiveOrders: number;
  averageWaitMinutes: number;
  message: string;
}

export interface AnalyticsSummary {
  totalOrdersToday: number;
  totalSalesToday: number;
  activeQueueCount: number;
  avgPrepTimeMinutes: number;
  popularDishes: { name: string; count: number; revenue: number }[];
  hourlyVolume: { hour: string; count: number }[];
}
