import type { Transaction, Category, Region, Channel, ProductPerformance, CustomerSegmentStats } from '../types/dashboard';

const PRODUCTS: Record<Category, { name: string; basePrice: number; margin: number }[]> = {
  'Electronics': [
    { name: 'Pro Headphones', basePrice: 249, margin: 0.45 },
    { name: 'Smart Watch v4', basePrice: 329, margin: 0.50 },
    { name: 'Ergonomic Keyboard', basePrice: 129, margin: 0.55 },
    { name: 'UltraWide Monitor', basePrice: 599, margin: 0.38 },
    { name: 'Noise Cancelling Earbuds', basePrice: 179, margin: 0.48 },
    { name: 'Wireless Charger Pad', basePrice: 49, margin: 0.60 }
  ],
  'Fashion': [
    { name: 'Tech Hoodie', basePrice: 85, margin: 0.65 },
    { name: 'Slim Fit Denim', basePrice: 75, margin: 0.60 },
    { name: 'Breathable Sneakers', basePrice: 110, margin: 0.55 },
    { name: 'Leather Messenger Bag', basePrice: 145, margin: 0.62 },
    { name: 'Summer Linen Shirt', basePrice: 60, margin: 0.68 },
    { name: 'Running Socks Pack', basePrice: 24, margin: 0.70 }
  ],
  'Home & Kitchen': [
    { name: 'Pour Over Coffee Maker', basePrice: 45, margin: 0.55 },
    { name: 'Smart LED Bulb Pack', basePrice: 69, margin: 0.50 },
    { name: 'Air Purifier Pro', basePrice: 220, margin: 0.45 },
    { name: 'Non-Stick Skillet', basePrice: 55, margin: 0.58 },
    { name: 'Scented Candle Set', basePrice: 32, margin: 0.70 },
    { name: 'Chef Knife 8-inch', basePrice: 89, margin: 0.52 }
  ],
  'Beauty & Personal Care': [
    { name: 'Moisturizing Cream', basePrice: 38, margin: 0.75 },
    { name: 'Organic Beard Oil', basePrice: 28, margin: 0.72 },
    { name: 'Sonic Toothbrush', basePrice: 95, margin: 0.60 },
    { name: 'Hydrating Lip Balm', basePrice: 12, margin: 0.80 },
    { name: 'Sandalwood Body Wash', basePrice: 22, margin: 0.70 },
    { name: 'Mineral Sunscreen', basePrice: 26, margin: 0.74 }
  ],
  'Sports & Outdoors': [
    { name: 'Insulated Water Bottle', basePrice: 35, margin: 0.60 },
    { name: 'Yoga Mat Pro', basePrice: 65, margin: 0.58 },
    { name: 'Resistance Band Set', basePrice: 29, margin: 0.65 },
    { name: 'Camp Backpack 30L', basePrice: 125, margin: 0.50 },
    { name: 'Adjustable Dumbbells', basePrice: 280, margin: 0.40 },
    { name: 'Microfiber Towel', basePrice: 18, margin: 0.68 }
  ]
};

const CUSTOMERS = [
  'Liam Smith', 'Olivia Johnson', 'Noah Williams', 'Emma Brown', 'Oliver Jones',
  'Ava Garcia', 'Elijah Miller', 'Charlotte Davis', 'William Rodriguez', 'Sophia Martinez',
  'James Hernandez', 'Amelia Lopez', 'Benjamin Gonzalez', 'Isabella Wilson', 'Lucas Anderson',
  'Mia Thomas', 'Henry Taylor', 'Evelyn Moore', 'Alexander Jackson', 'Harper Martin',
  'Mason Lee', 'Camila Perez', 'Michael Thompson', 'Gianna White', 'Ethan Harris',
  'Abigail Sanchez', 'Daniel Clark', 'Luna Ramirez', 'Jacob Lewis', 'Ella Robinson'
];

const REGIONS: Region[] = ['North', 'South', 'East', 'West', 'Central'];

// Helper to generate dates between startDate and endDate
function getDaysArray(start: Date, end: Date): string[] {
  const arr = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt).toISOString().split('T')[0]);
  }
  return arr;
}

export function generateMockData(scenario: 'baseline' | 'holiday' | 'supply' | 'growth'): Transaction[] {
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-06-13');
  const dates = getDaysArray(startDate, endDate);
  const transactions: Transaction[] = [];
  
  let idCounter = 1000;

  // Scenario multipliers
  let priceMultiplier = 1.0;
  let volumeMultiplier = 1.0;
  let discountProb = 0.3; // probability of a transaction having a discount
  let baseDiscount = 0.05;

  if (scenario === 'holiday') {
    volumeMultiplier = 1.45;
    discountProb = 0.6;
    baseDiscount = 0.15;
  } else if (scenario === 'supply') {
    priceMultiplier = 1.20;
    volumeMultiplier = 0.70;
    discountProb = 0.1;
    baseDiscount = 0.02;
  } else if (scenario === 'growth') {
    volumeMultiplier = 1.20;
    discountProb = 0.35;
    baseDiscount = 0.08;
  }

  // Iterate over dates, adding transactions based on scenario
  dates.forEach((dateStr, index) => {
    // Determine the base rate of orders per day (e.g. 2 to 6 orders per day on average)
    let dailyOrders = Math.floor(Math.random() * 5) + 2; 

    // Apply scenario-specific volume adjustments
    dailyOrders = Math.round(dailyOrders * volumeMultiplier);

    // Apply time-based multipliers (growth scenario ramp up, weekend spikes, spring surge)
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    const dayIndex = index;
    const totalDays = dates.length;

    // Weekend spike (Saturdays and Sundays have 30% more sales)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dailyOrders = Math.round(dailyOrders * 1.3);
    }

    // Growth scenario: linear ramp up over time (from 0.8x in Jan to 1.5x in June)
    if (scenario === 'growth') {
      const timeRatio = dayIndex / totalDays;
      const growthMult = 0.7 + timeRatio * 0.9; // 0.7 to 1.6
      dailyOrders = Math.round(dailyOrders * growthMult);
    }

    // Holiday scenario: spike in late March (Easter/Spring clearance) and mid-May
    if (scenario === 'holiday') {
      if (dateStr.includes('-03-') || dateStr.includes('-05-')) {
        dailyOrders = Math.round(dailyOrders * 1.5);
      }
    }

    for (let o = 0; o < dailyOrders; o++) {
      // Pick random customer
      const customerName = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
      
      // Pick random category with uneven distribution (Electronics and Fashion are largest)
      const categories: Category[] = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Outdoors'];
      const categoryWeights = [0.30, 0.25, 0.18, 0.15, 0.12];
      
      // Simple weighted category selection
      let r = Math.random();
      let categoryIndex = 0;
      let sum = 0;
      for (let i = 0; i < categories.length; i++) {
        sum += categoryWeights[i];
        if (r <= sum) {
          categoryIndex = i;
          break;
        }
      }
      const category = categories[categoryIndex];

      // Pick product
      const productList = PRODUCTS[category];
      const productObj = productList[Math.floor(Math.random() * productList.length)];

      // Apply price adjustments
      let price = productObj.basePrice * priceMultiplier;
      // Small random price variance (-3% to +3%)
      price = price * (1 + (Math.random() * 0.06 - 0.03));
      price = Math.round(price * 100) / 100;

      // Cost of goods sold (COGS)
      const cost = Math.round(price * (1 - productObj.margin) * 100) / 100;

      // Quantity (weighted towards 1 and 2)
      let quantity = 1;
      const qRand = Math.random();
      if (qRand > 0.92) quantity = 4;
      else if (qRand > 0.78) quantity = 3;
      else if (qRand > 0.45) quantity = 2;

      // Apply discounts
      let discount = 0;
      if (Math.random() < discountProb) {
        // base discount + random variance (0 to 15%)
        discount = baseDiscount + (Math.floor(Math.random() * 4) * 0.05);
        discount = Math.min(0.50, Math.round(discount * 100) / 100); // max 50% discount
      }

      // Calculate final revenue
      const revenue = Math.round(price * quantity * (1 - discount) * 100) / 100;

      // Region & Channel distribution
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      // Channel: Online is typically larger (45%), Flagship (25%), Boutique (15%), Partners (15%)
      const channels: Channel[] = ['Online', 'Flagship Store', 'Boutique', 'Retail Partner'];
      const channelWeights = [0.45, 0.25, 0.15, 0.15];
      r = Math.random();
      let channelIndex = 0;
      sum = 0;
      for (let i = 0; i < channels.length; i++) {
        sum += channelWeights[i];
        if (r <= sum) {
          channelIndex = i;
          break;
        }
      }
      const channel = channels[channelIndex];

      // Customer type
      const isReturningCustomer = Math.random() < (channel === 'Online' || channel === 'Boutique' ? 0.45 : 0.28);

      // Customer rating
      let rating = 5;
      const ratingRand = Math.random();
      if (ratingRand > 0.5) rating = 5;
      else if (ratingRand > 0.25) rating = 4;
      else if (ratingRand > 0.1) rating = 3;
      else if (ratingRand > 0.03) rating = 2;
      else rating = 1;

      // Adjust rating for bad scenarios or high discount
      if (scenario === 'supply' && Math.random() > 0.6) {
        rating = Math.max(1, rating - 1); // slightly lower rating due to stock issues/high prices
      }

      idCounter++;
      transactions.push({
        id: `TX-${idCounter}`,
        date: dateStr,
        customerName,
        productName: productObj.name,
        category,
        price,
        quantity,
        revenue,
        discount,
        cost: cost * quantity,
        region,
        channel,
        isReturningCustomer,
        rating
      });
    }
  });

  return transactions.sort((a, b) => b.date.localeCompare(a.date)); // descending dates
}

// Global Filter Utility
export function filterTransactions(transactions: Transaction[], filters: {
  startDate: string;
  endDate: string;
  region: string;
  channel: string;
  category: string;
}): Transaction[] {
  return transactions.filter(t => {
    // Date filter
    if (t.date < filters.startDate || t.date > filters.endDate) return false;
    // Region filter
    if (filters.region !== 'All' && t.region !== filters.region) return false;
    // Channel filter
    if (filters.channel !== 'All' && t.channel !== filters.channel) return false;
    // Category filter
    if (filters.category !== 'All' && t.category !== filters.category) return false;
    
    return true;
  });
}

// Aggregate stats calculations
export function calculateStats(
  currentData: Transaction[], 
  historicalData: Transaction[] // used for calculating delta percentages
): {
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
} {
  const totalRevenue = currentData.reduce((sum, t) => sum + t.revenue, 0);
  const totalOrders = currentData.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const totalCost = currentData.reduce((sum, t) => sum + t.cost, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Conversion rate (mock assumption: we have baseline website/store visitors count)
  // Let's assume visitors scale with volume of transactions, say 30 orders per 1000 visitors
  // Conversion rate = orders / visitors.
  const estimatedVisitors = totalOrders * 32.5 + Math.random() * 100;
  const conversionRate = estimatedVisitors > 0 ? (totalOrders / estimatedVisitors) * 100 : 0.0;

  // Let's estimate Customer Acquisition Cost (CAC)
  // Average CAC around $25-$35 based on marketing spend ratio.
  const customerAcquisitionCost = 28.5 + (Math.sin(totalRevenue / 10000) * 4);

  // Deltas relative to historical comparative data
  const histRevenue = historicalData.reduce((sum, t) => sum + t.revenue, 0);
  const histOrders = historicalData.length;
  const histAOV = histOrders > 0 ? histRevenue / histOrders : 0;
  const histVisitors = histOrders * 32.5 + 50;
  const histConv = histVisitors > 0 ? (histOrders / histVisitors) * 100 : 0;

  const totalRevenueDelta = histRevenue > 0 ? ((totalRevenue - histRevenue) / histRevenue) * 100 : 0;
  const totalOrdersDelta = histOrders > 0 ? ((totalOrders - histOrders) / histOrders) * 100 : 0;
  const averageOrderValueDelta = histAOV > 0 ? ((averageOrderValue - histAOV) / histAOV) * 100 : 0;
  const conversionRateDelta = histConv > 0 ? ((conversionRate - histConv) / histConv) * 100 : 0;

  return {
    totalRevenue: Math.round(totalRevenue),
    totalRevenueDelta: Math.round(totalRevenueDelta * 10) / 10,
    totalOrders,
    totalOrdersDelta: Math.round(totalOrdersDelta * 10) / 10,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    averageOrderValueDelta: Math.round(averageOrderValueDelta * 10) / 10,
    conversionRate: Math.round(conversionRate * 100) / 100,
    conversionRateDelta: Math.round(conversionRateDelta * 10) / 10,
    grossProfit: Math.round(grossProfit),
    grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
    customerAcquisitionCost: Math.round(customerAcquisitionCost * 100) / 100
  };
}

// Product performance aggregator
export function getProductPerformance(transactions: Transaction[]): ProductPerformance[] {
  const stats: Record<string, { category: Category; unitsSold: number; revenue: number; profit: number; cost: number }> = {};
  
  transactions.forEach(t => {
    if (!stats[t.productName]) {
      stats[t.productName] = {
        category: t.category,
        unitsSold: 0,
        revenue: 0,
        profit: 0,
        cost: 0
      };
    }
    const s = stats[t.productName];
    s.unitsSold += t.quantity;
    s.revenue += t.revenue;
    s.cost += t.cost;
    s.profit += (t.revenue - t.cost);
  });

  // Unique list of product names to assign mock stock values
  return Object.entries(stats).map(([productName, data]) => {
    // Generate a pseudo-random stock level between 5 and 99 based on productName hash
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      hash = productName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const stockLevel = Math.abs(hash % 90) + 10;
    
    // Average velocity = units sold divided by days in range (let's assume 30 days default or scaled)
    const salesVelocity = Math.round((data.unitsSold / 45) * 10) / 10;

    return {
      productName,
      category: data.category,
      unitsSold: data.unitsSold,
      revenue: Math.round(data.revenue),
      profit: Math.round(data.profit),
      profitMargin: Math.round((data.profit / data.revenue) * 1000) / 10,
      stockLevel,
      salesVelocity
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

// Customer insight aggregator
export function getCustomerSegmentStats(transactions: Transaction[]): CustomerSegmentStats {
  let newCount = 0;
  let returningCount = 0;
  let revenueNew = 0;
  let revenueReturning = 0;

  const channelDistribution: Record<Channel, number> = {
    'Online': 0,
    'Flagship Store': 0,
    'Boutique': 0,
    'Retail Partner': 0
  };

  transactions.forEach(t => {
    if (t.isReturningCustomer) {
      returningCount++;
      revenueReturning += t.revenue;
    } else {
      newCount++;
      revenueNew += t.revenue;
    }
    channelDistribution[t.channel] = (channelDistribution[t.channel] || 0) + t.revenue;
  });

  // Round results
  const totalRevenue = revenueNew + revenueReturning;
  Object.keys(channelDistribution).forEach(k => {
    const key = k as Channel;
    channelDistribution[key] = Math.round(channelDistribution[key]);
  });

  // Calculate LTV
  // Returning customers buy more frequently. Average LTV calculation:
  const averageLtv = totalRevenue / (newCount + returningCount * 0.4 || 1) * 3.4;

  return {
    newCustomersCount: newCount,
    returningCustomersCount: returningCount,
    revenueNew: Math.round(revenueNew),
    revenueReturning: Math.round(revenueReturning),
    channelDistribution,
    averageLtv: Math.round(averageLtv)
  };
}

// Apply simulator calculations
// Returns simulated stats and a projection function
export function runForecastingSimulation(
  currentStats: { totalRevenue: number; totalOrders: number; conversionRate: number; grossProfit: number },
  params: { marketingSpendChange: number; discountChange: number; trafficChange: number; pricingChange: number }
) {
  // Simulator formulas:
  // 1. Web Traffic impact:
  //    - Directly scales with trafficChange.
  //    - Marketing spend change also influences traffic: +10% marketing = +3% traffic.
  const trafficMultiplier = 1 + (params.trafficChange / 100) + (params.marketingSpendChange / 100) * 0.3;
  
  // 2. Conversion rate impact:
  //    - Discounts increase conversion rate: +10% discount absolute = +20% conversion rate relative.
  //    - Prices increase reduces conversion: +10% price = -15% conversion relative.
  const priceConversionEffect = params.pricingChange > 0 ? (params.pricingChange * -1.5) : (params.pricingChange * -0.8); // elastic demand
  const conversionMultiplier = 1 + (params.discountChange * 2 / 100) + (priceConversionEffect / 100);

  // 3. Average Order Value (AOV) impact:
  //    - Direct price change: +10% price = +10% AOV base.
  //    - Discount change: +10% discount absolute = -10% AOV base.
  const aovMultiplier = 1 + (params.pricingChange / 100) - (params.discountChange / 100);

  // Calculations
  const simulatedOrders = Math.round(currentStats.totalOrders * trafficMultiplier * conversionMultiplier);
  const baseAov = currentStats.totalRevenue / (currentStats.totalOrders || 1);
  const simulatedAov = baseAov * aovMultiplier;
  const simulatedRevenue = Math.round(simulatedOrders * simulatedAov);

  // Profit Margin impact:
  //    - Higher prices = higher margins.
  //    - Higher discounts = lower margins.
  //    - Higher marketing spend = cost increase (deducted from net profit).
  const currentMargin = currentStats.grossProfit / (currentStats.totalRevenue || 1);
  // discount change directly cuts profit margin
  // pricing change directly adds/subtracts margin
  const simulatedMargin = Math.max(0.1, currentMargin + (params.pricingChange / 100) - (params.discountChange / 100));
  
  // Gross profit
  const simulatedGrossProfit = Math.round(simulatedRevenue * simulatedMargin);

  return {
    simulatedRevenue,
    simulatedOrders,
    simulatedAov: Math.round(simulatedAov * 100) / 100,
    simulatedGrossProfit,
    simulatedMargin: Math.round(simulatedMargin * 1000) / 10
  };
}
