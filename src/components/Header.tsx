import React from 'react';
import { Sun, Moon, Filter, RefreshCw } from 'lucide-react';
import type { Filters } from '../types/dashboard';

interface HeaderProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  scenario: 'baseline' | 'holiday' | 'supply' | 'growth';
  setScenario: (scenario: 'baseline' | 'holiday' | 'supply' | 'growth') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onRegenerateData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  setFilters,
  scenario,
  setScenario,
  theme,
  toggleTheme,
  onRegenerateData
}) => {
  const handlePresetChange = (preset: Filters['datePreset']) => {
    const today = new Date('2026-06-13'); // Fixed current date for mock integrity
    let startDate = '2026-01-01';
    let endDate = '2026-06-13';

    if (preset === 'today') {
      startDate = '2026-06-13';
    } else if (preset === '7d') {
      const prev = new Date(today);
      prev.setDate(today.getDate() - 7);
      startDate = prev.toISOString().split('T')[0];
    } else if (preset === '30d') {
      const prev = new Date(today);
      prev.setDate(today.getDate() - 30);
      startDate = prev.toISOString().split('T')[0];
    } else if (preset === 'ytd') {
      startDate = '2026-01-01';
    }

    setFilters(prev => ({
      ...prev,
      datePreset: preset,
      startDate,
      endDate
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    setFilters(prev => ({
      ...prev,
      datePreset: 'custom',
      [field]: val
    }));
  };

  const handleFilterChange = (field: 'region' | 'channel' | 'category', val: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: val
    }));
  };

  return (
    <header className="header-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="gradient-text">
          Retail Sales Dashboard
        </h2>
        
        {/* Scenario Loader Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.2rem 0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Scenario:</span>
          <select 
            className="select-custom" 
            value={scenario}
            onChange={(e) => setScenario(e.target.value as any)}
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', background: 'transparent', border: 'none' }}
          >
            <option value="baseline">Baseline Sales</option>
            <option value="holiday">Holiday/Spring Surge</option>
            <option value="supply">Supply chain Shock</option>
            <option value="growth">Aggressive Growth</option>
          </select>
          <button 
            onClick={onRegenerateData}
            className="btn-icon" 
            style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'transparent' }}
            title="Force Regenerate Dataset"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="filters-bar">
        {/* Date presets selection */}
        <select 
          className="select-custom"
          value={filters.datePreset}
          onChange={(e) => handlePresetChange(e.target.value as any)}
          style={{ fontSize: '0.85rem' }}
        >
          <option value="ytd">Year-to-Date (YTD)</option>
          <option value="30d">Last 30 Days</option>
          <option value="7d">Last 7 Days</option>
          <option value="today">Today</option>
          <option value="custom">Custom Date Range</option>
        </select>

        {/* Custom date range inputs */}
        {filters.datePreset === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input 
              type="date" 
              className="input-custom" 
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
            <input 
              type="date" 
              className="input-custom" 
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
            />
          </div>
        )}

        {/* Region drop list */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="select-custom"
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
        </div>

        {/* Channel drop list */}
        <select 
          className="select-custom"
          value={filters.channel}
          onChange={(e) => handleFilterChange('channel', e.target.value)}
          style={{ fontSize: '0.85rem' }}
        >
          <option value="All">All Channels</option>
          <option value="Online">Online Store</option>
          <option value="Flagship Store">Flagship Store</option>
          <option value="Boutique">Boutique</option>
          <option value="Retail Partner">Retail Partner</option>
        </select>

        {/* Theme mode toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
