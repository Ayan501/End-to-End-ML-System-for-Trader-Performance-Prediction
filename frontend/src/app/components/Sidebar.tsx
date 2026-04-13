import { LayoutDashboard, Home, FileText, Network, TrendingUp, Settings, Zap, Users } from 'lucide-react';

export type PageName = 'Home' | 'Dashboard' | 'Reports' | 'Traders' | 'Models' | 'Prediction' | 'Settings';

interface SidebarProps {
  activeItem?: PageName;
  onNavigate?: (page: PageName) => void;
}

export function Sidebar({ activeItem = 'Dashboard', onNavigate }: SidebarProps) {
  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Reports', icon: FileText },
    { name: 'Traders', icon: Users },
    { name: 'Models', icon: Network },
    { name: 'Prediction', icon: TrendingUp },
    { name: 'Settings', icon: Settings },
  ] satisfies Array<{ name: PageName; icon: typeof Home }>;

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
            <button
              key={item.name}
              type="button"
              className={`nav-item ${activeItem === item.name ? 'active' : ''}`}
              onClick={() => onNavigate?.(item.name)}
            >
              <Icon />
              <span>{item.name}</span>
            </button>
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
