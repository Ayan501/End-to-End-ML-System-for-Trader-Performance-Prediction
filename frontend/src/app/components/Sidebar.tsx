import { LayoutDashboard, Home, FileText, Network, TrendingUp, Settings, Zap } from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem = 'Dashboard' }: SidebarProps) {
  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Reports', icon: FileText },
    { name: 'Models', icon: Network },
    { name: 'Prediction', icon: TrendingUp },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={24} color="#fff" />
          </div>
          <span className="logo-text">PrimeTrade</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href="#"
              className={`nav-item ${activeItem === item.name ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <div className="theme-dot violet"></div>
        <div className="theme-dot cyan"></div>
        <div className="theme-dot orange"></div>
      </div>
    </aside>
  );
}
