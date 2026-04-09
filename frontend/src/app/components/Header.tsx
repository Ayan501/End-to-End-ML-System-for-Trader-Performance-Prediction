export function Header() {
  return (
    <header className="dashboard-header">
      <span className="header-eyebrow">PrimeTrade ML Dashboard</span>
      
      <div className="header-top">
        <div>
          <h1 className="header-title">Analytics Control Room</h1>
          <p className="header-subtitle">
            Advanced ML prediction system mapping Fear & Greed sentiment with trader behavior patterns. 
            Real-time analysis and next-day PnL bucket prediction powered by ensemble models.
          </p>
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
