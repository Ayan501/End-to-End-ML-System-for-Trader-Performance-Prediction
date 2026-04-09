interface SentimentData {
  label: string;
  value: number;
  color: string;
  pnl: number;
}

interface SentimentBarsProps {
  data: SentimentData[];
}

export function SentimentBars({ data }: SentimentBarsProps) {
  const maxValue = Math.max(...data.map(d => Math.abs(d.pnl)));
  
  return (
    <div className="sentiment-list">
      {data.map((item, index) => {
        const width = (Math.abs(item.pnl) / maxValue) * 100;
        const isPositive = item.pnl >= 0;
        
        return (
          <div key={index} className="sentiment-item">
            <div className="sentiment-header">
              <div className="sentiment-label">
                <div
                  className="sentiment-dot"
                  style={{ background: item.color }}
                ></div>
                <span>{item.label}</span>
              </div>
              <div className="sentiment-value" style={{ color: isPositive ? '#10b981' : '#f43f5e' }}>
                ${item.pnl.toLocaleString()}
              </div>
            </div>
            <div className="sentiment-bar-container">
              <div
                className="sentiment-bar"
                style={{
                  width: `${width}%`,
                  background: item.color,
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
