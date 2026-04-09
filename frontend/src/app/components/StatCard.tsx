import { TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  color?: 'violet' | 'cyan' | 'orange' | 'pink';
  chart?: ReactNode;
}

export function StatCard({ title, value, change, icon, color = 'violet', chart }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && <div className="stat-icon">{icon}</div>}
      </div>
      
      <div className="stat-value">{value}</div>
      
      {change !== undefined && (
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(change)}%</span>
        </div>
      )}
      
      {chart && <div className="stat-chart">{chart}</div>}
    </div>
  );
}
