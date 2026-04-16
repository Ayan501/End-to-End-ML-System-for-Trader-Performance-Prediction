import { LogOut } from 'lucide-react';

interface HeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  userName?: string;
  onLogout?: () => void;
}

export function Header({
  eyebrow = 'PrimeTrade ML Dashboard',
  title = 'Analytics Control Room',
  subtitle = 'Advanced ML prediction system mapping Fear & Greed sentiment with trader behavior patterns. Real-time analysis and next-day PnL bucket prediction powered by ensemble models.',
  userName = 'PrimeTrade Lab',
  onLogout,
}: HeaderProps) {
  return (
    <header className="dashboard-header">
      <span className="header-eyebrow">{eyebrow}</span>
      
      <div className="header-top">
        <div>
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
        
        <div className="header-profile">
          <div className="profile-avatar">{userName.slice(0, 2).toUpperCase()}</div>
          <div className="profile-info">
            <h4>{userName}</h4>
            <p>Analytics Workspace</p>
          </div>
          {onLogout && (
            <button className="logout-button" type="button" onClick={onLogout} aria-label="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
