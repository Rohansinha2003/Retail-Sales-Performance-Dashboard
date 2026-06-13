import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users2, 
  SlidersHorizontal, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import type { DashboardAlert } from '../types/dashboard';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  alerts: DashboardAlert[];
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  alerts,
  onLogout
}) => {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'products', name: 'Product Analytics', icon: BarChart3 },
    { id: 'customers', name: 'Customer Insights', icon: Users2 },
    { id: 'simulator', name: 'Predictive Simulator', icon: SlidersHorizontal },
    { id: 'settings', name: 'Settings & Config', icon: Settings },
  ];

  const getAlertIcon = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="alert-icon" size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />;
      case 'success': return <CheckCircle className="alert-icon" size={16} style={{ color: '#10b981', flexShrink: 0 }} />;
      default: return <Info className="alert-icon" size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />;
    }
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <BarChart3 size={18} />
        </div>
        {!collapsed && <span className="logo-text gradient-text">RetailPulse AI</span>}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              title={item.name}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          );
        })}

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="menu-item"
          style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', borderRadius: 0, paddingLeft: '1.2rem', color: 'var(--color-danger)' }}
          title="Sign Out"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapsible toggle */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="menu-item"
          style={{ borderRadius: 0, paddingLeft: '1.2rem' }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </nav>

      {/* Notifications/Alerts Tray */}
      {!collapsed && alerts.length > 0 && (
        <div className="alerts-tray">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>
            <AlertTriangle size={12} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>System Alerts</span>
          </div>
          {alerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className={`alert-card alert-${alert.type}`}>
              {getAlertIcon(alert.type)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{ lineHeight: '1.2' }}>{alert.message}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dark)' }}>{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
