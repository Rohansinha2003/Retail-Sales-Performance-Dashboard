import React from 'react';
import { SlidersHorizontal, RefreshCw, AlertCircle, TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import type { SimulationParams } from '../types/dashboard';

interface SimulatorPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  actualStats: {
    totalRevenue: number;
    totalOrders: number;
    conversionRate: number;
    grossProfit: number;
  };
  simulatedStats: {
    simulatedRevenue: number;
    simulatedOrders: number;
    simulatedAov: number;
    simulatedGrossProfit: number;
    simulatedMargin: number;
  };
  isSimulating: boolean;
  setIsSimulating: (simulating: boolean) => void;
}

export const SimulatorPanel: React.FC<SimulatorPanelProps> = ({
  params,
  setParams,
  actualStats,
  simulatedStats,
  isSimulating,
  setIsSimulating
}) => {
  const handleSliderChange = (field: keyof SimulationParams, value: number) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }));
    if (!isSimulating) {
      setIsSimulating(true);
    }
  };

  const handleReset = () => {
    setParams({
      marketingSpendChange: 0,
      discountChange: 0,
      trafficChange: 0,
      pricingChange: 0
    });
    setIsSimulating(false);
  };

  // Calculate percentage improvements
  const revChangePct = ((simulatedStats.simulatedRevenue - actualStats.totalRevenue) / (actualStats.totalRevenue || 1)) * 100;
  const orderChangePct = ((simulatedStats.simulatedOrders - actualStats.totalOrders) / (actualStats.totalOrders || 1)) * 100;
  const profitChangePct = ((simulatedStats.simulatedGrossProfit - actualStats.grossProfit) / (actualStats.grossProfit || 1)) * 100;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="glass-card full-width-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
      
      {/* Sliders Input Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', borderRight: '1px solid var(--border-subtle)', paddingRight: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={18} style={{ color: 'var(--color-primary-light)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Forecasting Parameters</h3>
          </div>
          {(isSimulating || Object.values(params).some(v => v !== 0)) && (
            <button 
              onClick={handleReset} 
              className="btn btn-secondary" 
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
            >
              <RefreshCw size={10} />
              Reset All
            </button>
          )}
        </div>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Adjust sliders to project how marketing adjustments, product discounts, customer web traffic, and price optimizations affect store performance.
        </p>

        {/* Marketing Spend Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <span>Marketing Budget Offset</span>
            <span className="slider-value" style={{ color: params.marketingSpendChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {params.marketingSpendChange >= 0 ? '+' : ''}{params.marketingSpendChange}%
            </span>
          </div>
          <input 
            type="range" 
            min="-50" 
            max="100" 
            value={params.marketingSpendChange}
            onChange={(e) => handleSliderChange('marketingSpendChange', parseInt(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Web Traffic Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <span>Organic Traffic Growth</span>
            <span className="slider-value" style={{ color: params.trafficChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {params.trafficChange >= 0 ? '+' : ''}{params.trafficChange}%
            </span>
          </div>
          <input 
            type="range" 
            min="-50" 
            max="100" 
            value={params.trafficChange}
            onChange={(e) => handleSliderChange('trafficChange', parseInt(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Pricing Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <span>Base Pricing Shift</span>
            <span className="slider-value" style={{ color: params.pricingChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {params.pricingChange >= 0 ? '+' : ''}{params.pricingChange}%
            </span>
          </div>
          <input 
            type="range" 
            min="-20" 
            max="20" 
            value={params.pricingChange}
            onChange={(e) => handleSliderChange('pricingChange', parseInt(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Discounts Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <span>Storewide Discount Buffer</span>
            <span className="slider-value" style={{ color: params.discountChange >= 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {params.discountChange >= 0 ? '+' : ''}{params.discountChange}%
            </span>
          </div>
          <input 
            type="range" 
            min="-10" 
            max="30" 
            value={params.discountChange}
            onChange={(e) => handleSliderChange('discountChange', parseInt(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>

      {/* Projections Display Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Simulated Projections</h3>
        
        {!isSimulating ? (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              border: '1px dashed var(--border-medium)', 
              borderRadius: '12px',
              padding: '2rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.01)'
            }}
          >
            <AlertCircle size={32} style={{ color: 'var(--text-dark)', marginBottom: '0.8rem' }} />
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Forecaster Idle</span>
            <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Adjust any slider on the left to generate predictive dashboard results.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Project Card: Revenue */}
            <div 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '10px', 
                padding: '0.8rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary-light)', padding: '0.4rem', borderRadius: '6px' }}>
                  <DollarSign size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Sales Revenue</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>{formatCurrency(simulatedStats.simulatedRevenue)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>from {formatCurrency(actualStats.totalRevenue)}</span>
                  </div>
                </div>
              </div>
              <span className={`trend-badge ${revChangePct >= 0 ? 'trend-up' : 'trend-down'}`}>
                {revChangePct >= 0 ? '+' : ''}{revChangePct.toFixed(1)}%
              </span>
            </div>

            {/* Project Card: Profit */}
            <div 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '10px', 
                padding: '0.8rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '0.4rem', borderRadius: '6px' }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Gross Profit</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>{formatCurrency(simulatedStats.simulatedGrossProfit)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>margin: {simulatedStats.simulatedMargin}%</span>
                  </div>
                </div>
              </div>
              <span className={`trend-badge ${profitChangePct >= 0 ? 'trend-up' : 'trend-down'}`}>
                {profitChangePct >= 0 ? '+' : ''}{profitChangePct.toFixed(1)}%
              </span>
            </div>

            {/* Project Card: Orders */}
            <div 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '10px', 
                padding: '0.8rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-secondary)', padding: '0.4rem', borderRadius: '6px' }}>
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Orders Volume</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>{simulatedStats.simulatedOrders.toLocaleString()}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>avg AOV: ${simulatedStats.simulatedAov}</span>
                  </div>
                </div>
              </div>
              <span className={`trend-badge ${orderChangePct >= 0 ? 'trend-up' : 'trend-down'}`}>
                {orderChangePct >= 0 ? '+' : ''}{orderChangePct.toFixed(1)}%
              </span>
            </div>

            {/* Insight Statement */}
            <div 
              style={{ 
                background: 'rgba(99, 102, 241, 0.04)', 
                border: '1px dashed rgba(99, 102, 241, 0.2)', 
                borderRadius: '8px', 
                padding: '0.8rem', 
                display: 'flex', 
                gap: '0.5rem', 
                fontSize: '0.75rem',
                lineHeight: '1.3'
              }}
            >
              <Percent size={14} style={{ color: 'var(--color-primary-light)', flexShrink: 0 }} />
              <div>
                <strong>Simulation Insight:</strong> By shifting base prices by {params.pricingChange >= 0 ? '+' : ''}{params.pricingChange}% and running a {params.discountChange >= 0 ? '+' : ''}{params.discountChange}% discount strategy, customer conversion rates are expected to adjust by {((simulatedStats.simulatedOrders - actualStats.totalOrders) / (actualStats.totalOrders || 1) * 0.8).toFixed(1)}% causing profit margins to finalize around {simulatedStats.simulatedMargin}%.
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
