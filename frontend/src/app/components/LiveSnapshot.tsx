import { Activity } from 'lucide-react';

interface SnapshotData {
  label: string;
  value: string | number;
}

interface LiveSnapshotProps {
  data: SnapshotData[];
}

export function LiveSnapshot({ data }: LiveSnapshotProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Activity size={20} />
          Live Snapshot
        </h2>
        <span className="panel-badge">Real-time</span>
      </div>
      
      <div className="panel-content">
        <div className="snapshot-list">
          {data.map((item, index) => (
            <div key={index} className="snapshot-item">
              <span className="snapshot-label">{item.label}</span>
              <span className="snapshot-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
