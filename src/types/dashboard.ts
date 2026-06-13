export type Category = 'Electronics' | 'Fashion' | 'Home & Kitchen' | 'Beauty & Personal Care' | 'Sports & Outdoors';
export type Region = 'North' | 'South' | 'East' | 'West' | 'Central';
export type Channel = 'Online' | 'Flagship Store' | 'Boutique' | 'Retail Partner';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  productName: string;
  category: Category;
  price: number;
  quantity: number;
  revenue: number; // (price * quantity) * (1 - discount)
  discount: number; // e.g. 0.15 for 15%
  cost: number; // COGS (cost of goods sold)
  region: Region;
  channel: Channel;
  isReturningCustomer: boolean;
  rating: number; // customer rating 1-5
}

export interface Filters {
  datePreset: 'today' | '7d' | '30d' | 'ytd' | 'custom';
  startDate: string;
  endDate: string;
  region: Region | 'All';
  channel: Channel | 'All';
  category: Category | 'All';
}

export interface SimulationParams {
  marketingSpendChange: number; // percentage change, e.g., -50 to 100
  discountChange: number; // absolute percentage change in discounts, e.g., -10 to 30
  trafficChange: number; // percentage change in visitor traffic, e.g., -50 to 100
  pricingChange: number; // percentage change in product price, e.g., -20 to 20
}

export interface DashboardStats {
  totalRevenue: number;
  totalRevenueDelta: number;
  totalOrders: number;
  totalOrdersDelta: number;
  averageOrderValue: number;
  averageOrderValueDelta: number;
  conversionRate: number;
  conversionRateDelta: number;
  grossProfit: number;
  grossProfitMargin: number;
  customerAcquisitionCost: number;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
}

export interface ProductPerformance {
  productName: string;
  category: Category;
  unitsSold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  stockLevel: number; // 0 to 100
  salesVelocity: number; // units/day average
}

export interface CustomerSegmentStats {
  newCustomersCount: number;
  returningCustomersCount: number;
  revenueNew: number;
  revenueReturning: number;
  channelDistribution: Record<Channel, number>;
  averageLtv: number;
}
