import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  delta: number;
  icon: React.ComponentType<any>;
  sparklineData?: number[];
  simulatedValue?: string | number | null;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  icon: Icon,
  sparklineData = [],
  simulatedValue = null,
  description
}) => {
  const isPositive = delta >= 0;

  // Generate SVG path for sparkline
  const generateSparklinePath = (data: number[]) => {
    if (data.length < 2) return '';
    const width = 120;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return data
      .map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        // Invert Y because SVG coordinates start at top left
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const sparklinePath = generateSparklinePath(sparklineData);

  return (
    <div className="glass-card">
      <div className="metric-header">
        <span>{title}</span>
        <div 
          style={{ 
            background: 'rgba(255,255,255,0.04)', 
            border: '1px solid var(--border-subtle)', 
            padding: '0.4rem', 
            borderRadius: '8px',
            color: 'var(--color-primary-light)'
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      <div className="metric-value">
        {value}
        
        {/* If we have a simulation, show the glowing forecast value next to it */}
        {simulatedValue !== null && simulatedValue !== value && (
          <span 
            style={{ 
              fontSize: '1.1rem', 
              color: 'var(--color-secondary)',
              fontWeight: 500,
              marginLeft: '0.5rem',
              textShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px dashed var(--color-secondary)',
              borderRadius: '6px',
              padding: '0.1rem 0.3rem',
              alignSelf: 'center'
            }}
            title="Simulated Forecast"
          >
            → {simulatedValue}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.6rem' }}>
        <div className="metric-footer">
          <span className={`trend-badge ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? '+' : ''}{delta}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {description || 'vs last period'}
          </span>
        </div>

        {/* Sparkline Drawing */}
        {sparklineData.length > 1 && (
          <svg width="120" height="30" style={{ overflow: 'visible', opacity: 0.85 }}>
            <path
              d={sparklinePath}
              fill="none"
              stroke={isPositive ? 'var(--color-success)' : 'var(--color-danger)'}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
