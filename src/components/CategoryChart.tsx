import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Transaction, Category } from '../types/dashboard';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  transactions: Transaction[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const categoriesData: Record<Category, number> = {
      'Electronics': 0,
      'Fashion': 0,
      'Home & Kitchen': 0,
      'Beauty & Personal Care': 0,
      'Sports & Outdoors': 0
    };

    transactions.forEach(t => {
      categoriesData[t.category] += t.revenue;
    });

    const labels = Object.keys(categoriesData);
    const data = Object.values(categoriesData).map(v => Math.round(v));
    const total = data.reduce((a, b) => a + b, 0);

    const percentages = data.map(v => (total > 0 ? Math.round((v / total) * 100) : 0));

    return {
      labels,
      data,
      percentages
    };
  }, [transactions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'var(--text-muted)',
          boxWidth: 10,
          padding: 15,
          font: {
            family: 'Inter',
            size: 11
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const pct = chartData.percentages[i];
                return {
                  text: `${label} (${pct}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 1,
                  hidden: isNaN(value as number),
                  index: i
                };
              });
            }
            return [];
          }
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
            const val = context.parsed;
            const formattedVal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
            const index = context.dataIndex;
            const pct = chartData.percentages[index];
            return ` ${context.label}: ${formattedVal} (${pct}%)`;
          }
        }
      }
    }
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)',  // Violet/Indigo
          'rgba(6, 182, 212, 0.75)',  // Cyan
          'rgba(139, 92, 246, 0.75)', // Purple
          'rgba(16, 185, 129, 0.75)', // Emerald
          'rgba(245, 158, 11, 0.75)'   // Amber
        ],
        borderColor: [
          '#6366f1',
          '#06b6d4',
          '#8b5cf6',
          '#10b981',
          '#f59e0b'
        ],
        borderWidth: 1.5,
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="glass-card" style={{ height: '380px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sales by Category</h3>
      <div style={{ height: '260px', position: 'relative' }}>
        <Doughnut data={data} options={options} />
        {/* Center overlay label */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '32%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Sales
          </span>
          <h4 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
              chartData.data.reduce((a, b) => a + b, 0)
            )}
          </h4>
        </div>
      </div>
    </div>
  );
};
