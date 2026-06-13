import { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  TrendingUp, 
  Package, 
  Award,
  AlertTriangle,
  Users,
  Compass,
  Save
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { SalesChart } from './components/SalesChart';
import { CategoryChart } from './components/CategoryChart';
import { CustomerChart } from './components/CustomerChart';
import { OrdersTable } from './components/OrdersTable';
import { SimulatorPanel } from './components/SimulatorPanel';
import type { Transaction, Filters, SimulationParams, DashboardAlert } from './types/dashboard';
import { 
  generateMockData, 
  filterTransactions, 
  calculateStats, 
  getProductPerformance, 
  getCustomerSegmentStats 
} from './utils/dataGenerator';

function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Business Scenario & Data State
  const [scenario, setScenario] = useState<'baseline' | 'holiday' | 'supply' | 'growth'>('baseline');
  const [rawTransactions, setRawTransactions] = useState(() => generateMockData('baseline'));

  // Global Settings Config
  const [targetSales, setTargetSales] = useState<number>(450000);
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [showNotifications, setShowNotifications] = useState<boolean>(true);

  // Global Filter State (YTD by default)
  const [filters, setFilters] = useState<Filters>({
    datePreset: 'ytd',
    startDate: '2026-01-01',
    endDate: '2026-06-13',
    region: 'All',
    channel: 'All',
    category: 'All'
  });

  // Simulator Parameters state
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    marketingSpendChange: 0,
    discountChange: 0,
    trafficChange: 0,
    pricingChange: 0
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Dynamic Alerts feed state
  const [alerts, setAlerts] = useState<DashboardAlert[]>([
    { id: '1', type: 'warning', message: 'Low Stock: Pro Headphones (12 left in East region)', time: '10m ago' },
    { id: '2', type: 'success', message: 'Revenue Target Hit: Online Store exceeded 200K', time: '1h ago' },
    { id: '3', type: 'info', message: 'Weekly Sync: Growth scenario active. Baseline stats set.', time: '3h ago' }
  ]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle Theme helper
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Force regenerate mock dataset and push notification
  const handleRegenerateData = () => {
    const data = generateMockData(scenario);
    setRawTransactions(data);
    
    // Add success system alert
    const scenarioLabels = {
      baseline: 'Baseline Sales',
      holiday: 'Holiday/Spring Surge',
      supply: 'Supply Chain Shock',
      growth: 'Aggressive Growth'
    };

    const newAlert: DashboardAlert = {
      id: Date.now().toString(),
      type: 'success',
      message: `Scenario Loaded: "${scenarioLabels[scenario]}" - generated ${data.length} records.`,
      time: 'Just now'
    };
    
    if (showNotifications) {
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Trigger regeneration automatically when scenario changes
  useEffect(() => {
    handleRegenerateData();
    // Reset simulation parameters on scenario switch
    setSimulationParams({
      marketingSpendChange: 0,
      discountChange: 0,
      trafficChange: 0,
      pricingChange: 0
    });
    setIsSimulating(false);
  }, [scenario]);

  // CRUD state functions for transactions
  const handleAddTransaction = (newTx: Transaction) => {
    setRawTransactions(prev => [newTx, ...prev]);
    if (showNotifications) {
      setAlerts(prev => [
        {
          id: Date.now().toString(),
          type: 'success',
          message: `Order Added: ${newTx.id} (${newTx.customerName})`,
          time: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setRawTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    if (showNotifications) {
      setAlerts(prev => [
        {
          id: Date.now().toString(),
          type: 'success',
          message: `Order Updated: ${updatedTx.id}`,
          time: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    setRawTransactions(prev => prev.filter(t => t.id !== txId));
    if (showNotifications) {
      setAlerts(prev => [
        {
          id: Date.now().toString(),
          type: 'warning',
          message: `Order Deleted: ${txId}`,
          time: 'Just now'
        },
        ...prev
      ]);
    }
  };

  // 1. Process Global Filters
  const filteredTransactions = useMemo(() => {
    return filterTransactions(rawTransactions, filters);
  }, [rawTransactions, filters]);

  // 2. Generate Comparative Historical Baseline (used for Delta calculations)
  const historicalTransactions = useMemo(() => {
    // Generate a comparative dataset by scaling actuals with minor variance
    return filteredTransactions.map(t => {
      // Create seed from transaction ID to keep deltas deterministic for active filters
      let hash = 0;
      for (let i = 0; i < t.id.length; i++) {
        hash = t.id.charCodeAt(i) + ((hash << 5) - hash);
      }
      const variance = 0.92 + (Math.abs(hash % 100) / 1000); // 0.92 to 1.02 multiplier
      return {
        ...t,
        revenue: Math.round(t.revenue * variance * 100) / 100,
        cost: Math.round(t.cost * variance * 100) / 100
      };
    });
  }, [filteredTransactions]);

  // 3. Compute Metrics & Aggregations
  const stats = useMemo(() => {
    return calculateStats(filteredTransactions, historicalTransactions);
  }, [filteredTransactions, historicalTransactions]);

  // 4. Compute Product & Customer insights
  const productPerformances = useMemo(() => {
    return getProductPerformance(filteredTransactions);
  }, [filteredTransactions]);

  const customerStats = useMemo(() => {
    return getCustomerSegmentStats(filteredTransactions);
  }, [filteredTransactions]);

  // 5. Run Simulator Formulas
  const simulatedStats = useMemo(() => {
    const trafficMultiplier = 1 + (simulationParams.trafficChange / 100) + (simulationParams.marketingSpendChange / 100) * 0.3;
    const priceConversionEffect = simulationParams.pricingChange > 0 ? (simulationParams.pricingChange * -1.5) : (simulationParams.pricingChange * -0.8);
    const conversionMultiplier = 1 + (simulationParams.discountChange * 2 / 100) + (priceConversionEffect / 100);
    const aovMultiplier = 1 + (simulationParams.pricingChange / 100) - (simulationParams.discountChange / 100);
    
    const simulatedOrders = Math.round(stats.totalOrders * trafficMultiplier * conversionMultiplier);
    const simulatedRevenue = Math.round(simulatedOrders * (stats.averageOrderValue * aovMultiplier));
    
    const currentMargin = stats.grossProfit / (stats.totalRevenue || 1);
    const simulatedMargin = Math.max(0.1, currentMargin + (simulationParams.pricingChange / 100) - (simulationParams.discountChange / 100));
    const simulatedGrossProfit = Math.round(simulatedRevenue * simulatedMargin);

    return {
      simulatedRevenue,
      simulatedOrders,
      simulatedAov: Math.round((stats.averageOrderValue * aovMultiplier) * 100) / 100,
      simulatedGrossProfit,
      simulatedMargin: Math.round(simulatedMargin * 1000) / 10
    };
  }, [stats, simulationParams]);

  // 6. Generate Sparkline Data for Metric Cards (last 10 days of dates)
  const sparklines = useMemo(() => {
    const daily: Record<string, { rev: number; orders: number; aov: number }> = {};
    filteredTransactions.forEach(t => {
      if (!daily[t.date]) daily[t.date] = { rev: 0, orders: 0, aov: 0 };
      daily[t.date].rev += t.revenue;
      daily[t.date].orders += 1;
    });

    const sortedDates = Object.keys(daily).sort();
    const range = sortedDates.slice(-10); // last 10 records

    return {
      revenue: range.map(d => daily[d].rev),
      orders: range.map(d => daily[d].orders),
      aov: range.map(d => daily[d].orders > 0 ? daily[d].rev / daily[d].orders : 0)
    };
  }, [filteredTransactions]);

  // Settings config form handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: DashboardAlert = {
      id: Date.now().toString(),
      type: 'success',
      message: `Configuration saved successfully. Targets adjusted.`,
      time: 'Just now'
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Helper for formatting Currency outputs
  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        alerts={alerts}
      />

      <div className="main-content">
        <Header 
          filters={filters} 
          setFilters={setFilters} 
          scenario={scenario}
          setScenario={setScenario}
          theme={theme}
          toggleTheme={toggleTheme}
          onRegenerateData={handleRegenerateData}
        />

        {/* --- VIEW ROUTER --- */}
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI metrics cards grid */}
            <div className="metrics-grid">
              <MetricCard 
                title="Total Revenue" 
                value={formatCurrency(stats.totalRevenue)}
                delta={stats.totalRevenueDelta} 
                icon={DollarSign}
                sparklineData={sparklines.revenue}
                simulatedValue={isSimulating ? formatCurrency(simulatedStats.simulatedRevenue) : null}
              />
              <MetricCard 
                title="Total Orders" 
                value={stats.totalOrders.toLocaleString()} 
                delta={stats.totalOrdersDelta} 
                icon={ShoppingCart}
                sparklineData={sparklines.orders}
                simulatedValue={isSimulating ? simulatedStats.simulatedOrders.toLocaleString() : null}
              />
              <MetricCard 
                title="Average Order Value" 
                value={formatCurrency(stats.averageOrderValue)} 
                delta={stats.averageOrderValueDelta} 
                icon={TrendingUp}
                sparklineData={sparklines.aov}
                simulatedValue={isSimulating ? formatCurrency(simulatedStats.simulatedAov) : null}
              />
              <MetricCard 
                title="Conversion Rate" 
                value={`${stats.conversionRate}%`} 
                delta={stats.conversionRateDelta} 
                icon={Percent}
                sparklineData={[2.4, 2.9, 3.1, 2.8, 3.0, 3.4, 3.2, 3.6]} // simulated rate
                simulatedValue={isSimulating ? `${Math.round((stats.conversionRate * (simulatedStats.simulatedOrders / (stats.totalOrders || 1))) * 100) / 100}%` : null}
              />
            </div>

            {/* Visual Charts grid */}
            <div className="dashboard-grid-main">
              <SalesChart 
                transactions={filteredTransactions} 
                simulationParams={simulationParams} 
                isSimulating={isSimulating}
              />
              <CategoryChart transactions={filteredTransactions} />
            </div>

            {/* Recent Orders table */}
            <div className="dashboard-grid-main" style={{ gridTemplateColumns: '1fr' }}>
              <OrdersTable 
                transactions={filteredTransactions} 
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT ANALYTICS */}
        {activeTab === 'products' && (
          <div>
            {/* Metric widgets */}
            <div className="metrics-grid">
              <MetricCard 
                title="Bestseller Revenue" 
                value={productPerformances[0] ? formatCurrency(productPerformances[0].revenue) : '$0'} 
                delta={8.4} 
                icon={Award}
                description="Top product margin"
                sparklineData={[12, 18, 22, 19, 26, 32, 40]}
              />
              <MetricCard 
                title="Gross profit margin" 
                value={`${stats.grossProfitMargin}%`} 
                delta={2.1} 
                icon={Percent}
                description="Store average margin"
                sparklineData={[52, 53, 54, 52, 55, 56, 55]}
              />
              <MetricCard 
                title="Critical stock items" 
                value={productPerformances.filter(p => p.stockLevel < 35).length} 
                delta={-12.5} 
                icon={Package}
                description="Items with low stock"
              />
            </div>

            {/* Product Performance Table & Inventory Distribution */}
            <div className="dashboard-grid-main" style={{ gridTemplateColumns: '2.2fr 1fr' }}>
              
              {/* Product list glass card */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Bestsellers & Product Inventory</h3>
                <div className="table-wrapper">
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'center' }}>Units Sold</th>
                        <th style={{ textAlign: 'right' }}>Revenue</th>
                        <th style={{ textAlign: 'right' }}>Margin</th>
                        <th style={{ textAlign: 'center' }}>Stock Level</th>
                        <th style={{ textAlign: 'center' }}>Velocity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productPerformances.slice(0, 10).map((prod) => (
                        <tr key={prod.productName}>
                          <td style={{ fontWeight: 600 }}>{prod.productName}</td>
                          <td>{prod.category}</td>
                          <td style={{ textAlign: 'center' }}>{prod.unitsSold}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(prod.revenue)}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>{prod.profitMargin}%</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                              {/* Stock dynamic progress bar */}
                              <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    width: `${prod.stockLevel}%`, 
                                    height: '100%', 
                                    background: prod.stockLevel < 35 
                                      ? 'var(--color-danger)' 
                                      : prod.stockLevel < 60 
                                      ? 'var(--color-warning)' 
                                      : 'var(--color-success)' 
                                  }} 
                                />
                              </div>
                              <span style={{ fontSize: '0.75rem', width: '22px', textAlign: 'right', color: prod.stockLevel < 35 ? 'var(--color-danger)' : 'inherit' }}>
                                {prod.stockLevel}%
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span 
                              style={{ 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                background: prod.salesVelocity > 4 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)',
                                color: prod.salesVelocity > 4 ? 'var(--color-success)' : 'inherit',
                                fontSize: '0.75rem'
                              }}
                            >
                              {prod.salesVelocity}/day
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Regional contribution and stock warnings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Region Progress tracker */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.2rem' }}>Territory Share</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {['East', 'West', 'North', 'South', 'Central'].map(reg => {
                      const regRevenue = filteredTransactions
                        .filter(t => t.region === reg)
                        .reduce((sum, t) => sum + t.revenue, 0);
                      const pct = stats.totalRevenue > 0 ? Math.round((regRevenue / stats.totalRevenue) * 100) : 0;
                      
                      return (
                        <div key={reg}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 500 }}>{reg} Region</span>
                            <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stock Warning Box */}
                <div className="glass-card" style={{ border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', marginBottom: '0.6rem' }}>
                    <AlertTriangle size={18} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Procurement Warning</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                    The following product stocks are critically low and require immediate procurement restocking actions.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {productPerformances.filter(p => p.stockLevel < 35).slice(0, 3).map(prod => (
                      <div key={prod.productName} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                        <span style={{ fontWeight: 500 }}>{prod.productName}</span>
                        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{prod.stockLevel} left</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER INSIGHTS */}
        {activeTab === 'customers' && (
          <div>
            {/* KPI indicators */}
            <div className="metrics-grid">
              <MetricCard 
                title="Customer Lifetime Value" 
                value={formatCurrency(customerStats.averageLtv)} 
                delta={4.7} 
                icon={Users}
                description="Estimated average LTV"
                sparklineData={[720, 750, 790, 780, 810, 840]}
              />
              <MetricCard 
                title="Returning cohort rate" 
                value={`${Math.round((customerStats.returningCustomersCount / (customerStats.newCustomersCount + customerStats.returningCustomersCount || 1)) * 100)}%`} 
                delta={1.8} 
                icon={Compass}
                description="Loyalty share ratio"
                sparklineData={[38, 39, 41, 40, 42, 43]}
              />
              <MetricCard 
                title="New customers today" 
                value={customerStats.newCustomersCount} 
                delta={12.4} 
                icon={Users}
                description="Acquired this period"
              />
            </div>

            {/* Chart + Acquisition Channel Split */}
            <div className="dashboard-grid-main">
              <CustomerChart transactions={filteredTransactions} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Acquisition Channel metrics */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.2rem' }}>Traffic Source Splits</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {Object.entries(customerStats.channelDistribution).map(([chan, rev]) => {
                      const percentage = Math.round((rev / stats.totalRevenue) * 100);
                      return (
                        <div key={chan}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 500 }}>{chan}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{percentage}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                background: chan === 'Online' 
                                  ? 'var(--color-secondary)' 
                                  : chan === 'Flagship Store' 
                                  ? 'var(--color-primary)' 
                                  : 'var(--color-accent)' 
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>{formatCurrency(rev)} revenue generated</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cohort spend differences */}
                <div className="glass-card">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.8rem' }}>Cohort Spend Dispersal</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>New Client Average Ticket</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(Math.round(customerStats.revenueNew / (customerStats.newCustomersCount || 1)))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.5rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Loyal Client Average Ticket</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{formatCurrency(Math.round(customerStats.revenueReturning / (customerStats.returningCustomersCount || 1)))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PREDICTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Simulation controls panel */}
            <SimulatorPanel 
              params={simulationParams} 
              setParams={setSimulationParams}
              actualStats={stats}
              simulatedStats={simulatedStats}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
            />

            {/* Simulation Chart */}
            <SalesChart 
              transactions={filteredTransactions} 
              simulationParams={simulationParams} 
              isSimulating={isSimulating}
            />
          </div>
        )}

        {/* TAB 5: SETTINGS & CONFIG */}
        {activeTab === 'settings' && (
          <div className="glass-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }} className="gradient-text">
              System Settings & Parameters
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Modify core targets, currency symbols, and notification thresholds.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Sales Target Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Global Revenue Sales Target ($)</label>
                <input 
                  type="number" 
                  className="input-custom" 
                  value={targetSales} 
                  onChange={(e) => setTargetSales(parseInt(e.target.value))} 
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deltas on KPI widgets compile against this baseline target.</span>
              </div>

              {/* Currency Symbol selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Dashboard Currency Format</label>
                <select 
                  className="select-custom" 
                  value={currencySymbol} 
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                >
                  <option value="$">USD - Dollar ($)</option>
                  <option value="€">EUR - Euro (€)</option>
                  <option value="£">GBP - Pound (£)</option>
                  <option value="¥">JPY - Yen (¥)</option>
                </select>
              </div>

              {/* Notifications Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0' }}>
                <input 
                  type="checkbox" 
                  id="notifications" 
                  checked={showNotifications} 
                  onChange={(e) => setShowNotifications(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="notifications" style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                  Enable System Alerts & Toast Feeds
                </label>
              </div>

              {/* Reset Database Button */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  Save Configurations
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
