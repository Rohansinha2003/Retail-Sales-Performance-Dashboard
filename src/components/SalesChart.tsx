import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ScriptableContext } from 'chart.js';
import type { Transaction, SimulationParams } from '../types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  transactions: Transaction[];
  simulationParams: SimulationParams;
  isSimulating: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  transactions,
  simulationParams,
  isSimulating
}) => {
  // Aggregate sales by date
  const chartData = useMemo(() => {
    // Group and sort dates
    const dailyData: Record<string, { revenue: number; cost: number; orders: number }> = {};
    
    // Sort transactions chronologically for the chart (ascending)
    const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    sortedTx.forEach(t => {
      if (!dailyData[t.date]) {
        dailyData[t.date] = { revenue: 0, cost: 0, orders: 0 };
      }
      dailyData[t.date].revenue += t.revenue;
      dailyData[t.date].cost += t.cost;
      dailyData[t.date].orders += 1;
    });

    const labels = Object.keys(dailyData);
    const actualRevenue = labels.map(date => Math.round(dailyData[date].revenue));
    const grossProfit = labels.map(date => Math.round(dailyData[date].revenue - dailyData[date].cost));

    // Calculate simulation multipliers
    const trafficMultiplier = 1 + (simulationParams.trafficChange / 100) + (simulationParams.marketingSpendChange / 100) * 0.3;
    const priceConversionEffect = simulationParams.pricingChange > 0 ? (simulationParams.pricingChange * -1.5) : (simulationParams.pricingChange * -0.8);
    const conversionMultiplier = 1 + (simulationParams.discountChange * 2 / 100) + (priceConversionEffect / 100);
    const aovMultiplier = 1 + (simulationParams.pricingChange / 100) - (simulationParams.discountChange / 100);
    
    const simMultiplier = trafficMultiplier * conversionMultiplier * aovMultiplier;

    const simulatedRevenue = labels.map(date => {
      if (!isSimulating) return null;
      return Math.round(dailyData[date].revenue * simMultiplier);
    });

    return {
      labels: labels.map(l => {
        // format date slightly prettier: e.g. "Jun 13"
        const d = new Date(l);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }),
      actualRevenue,
      grossProfit,
      simulatedRevenue
    };
  }, [transactions, simulationParams, isSimulating]);

  // Chart options configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'var(--text-muted)',
          font: {
            family: 'Inter',
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(16, 18, 26, 0.95)',
        titleColor: '#fff',
        bodyColor: 'var(--text-main)',
        borderColor: 'var(--border-medium)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: {
          family: 'Outfit',
          weight: 'bold' as any
        },
        bodyFont: {
          family: 'Inter'
        },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--text-dark)',
          font: {
            size: 9
          },
          maxTicksLimit: 12
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)'
        },
        ticks: {
          color: 'var(--text-dark)',
          font: {
            size: 10
          },
          callback: function (value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Build dataset structure
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Actual Revenue',
        data: chartData.actualRevenue,
        borderColor: '#6366f1',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(99, 102, 241, 0.04)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.00)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverRadius: 5
      },
      {
        label: 'Gross Profit',
        data: chartData.grossProfit,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [5, 5],
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      ...(isSimulating && chartData.simulatedRevenue[0] !== null
        ? [
            {
              label: 'Forecasted Revenue (Simulated)',
              data: chartData.simulatedRevenue as number[],
              borderColor: '#06b6d4',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              borderDash: [4, 4],
              tension: 0.35,
              pointHoverBackgroundColor: '#06b6d4',
              pointHoverRadius: 5
            }
          ]
        : [])
    ]
  };

  return (
    <div className="glass-card" style={{ height: '380px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Sales & Revenue Trend</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical performance and overlay projections</p>
        </div>
        {isSimulating && (
          <span 
            style={{ 
              fontSize: '0.75rem', 
              color: 'var(--color-secondary)', 
              background: 'rgba(6, 182, 212, 0.08)', 
              border: '1px solid var(--color-secondary)',
              borderRadius: '6px', 
              padding: '0.15rem 0.4rem', 
              fontWeight: 500 
            }}
          >
            Forecasting Active
          </span>
        )}
      </div>
      <div style={{ height: '300px', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
