import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { Transaction } from '../types/dashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CustomerChartProps {
  transactions: Transaction[];
}

export const CustomerChart: React.FC<CustomerChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    // We group transactions by month (e.g. "2026-01" to "2026-06")
    const monthlyGroups: Record<string, { newRev: number; returningRev: number }> = {};
    
    // Sort transactions chronologically (ascending date)
    const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    sortedTx.forEach(t => {
      const monthKey = t.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = { newRev: 0, returningRev: 0 };
      }
      if (t.isReturningCustomer) {
        monthlyGroups[monthKey].returningRev += t.revenue;
      } else {
        monthlyGroups[monthKey].newRev += t.revenue;
      }
    });

    const monthNames: Record<string, string> = {
      '2026-01': 'Jan',
      '2026-02': 'Feb',
      '2026-03': 'Mar',
      '2026-04': 'Apr',
      '2026-05': 'May',
      '2026-06': 'Jun',
      '2026-07': 'Jul',
      '2026-08': 'Aug',
      '2026-09': 'Sep',
      '2026-10': 'Oct',
      '2026-11': 'Nov',
      '2026-12': 'Dec'
    };

    const labels = Object.keys(monthlyGroups).sort().map(key => monthNames[key] || key);
    const newCustomerRev = Object.keys(monthlyGroups).sort().map(key => Math.round(monthlyGroups[key].newRev));
    const returningCustomerRev = Object.keys(monthlyGroups).sort().map(key => Math.round(monthlyGroups[key].returningRev));

    return {
      labels,
      newCustomerRev,
      returningCustomerRev
    };
  }, [transactions]);

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
            size: 10
          }
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

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'New Customers',
        data: chartData.newCustomerRev,
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Returning Customers',
        data: chartData.returningCustomerRev,
        backgroundColor: 'rgba(6, 182, 212, 0.8)', // Cyan
        borderColor: '#06b6d4',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="glass-card" style={{ height: '380px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Cohort Engagement</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue distribution: New vs. Returning customers by month</p>
      </div>
      <div style={{ height: '280px', position: 'relative' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
