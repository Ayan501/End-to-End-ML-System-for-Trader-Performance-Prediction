interface HeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function Header({
  eyebrow = 'PrimeTrade ML Dashboard',
  title = 'Analytics Control Room',
  subtitle = 'Advanced ML prediction system mapping Fear & Greed sentiment with trader behavior patterns. Real-time analysis and next-day PnL bucket prediction powered by ensemble models.',
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
          <div className="profile-avatar">PT</div>
          <div className="profile-info">
            <h4>PrimeTrade Lab</h4>
            <p>Analytics Squad</p>
          </div>
        </div>
      </div>
    </header>
  );
}
