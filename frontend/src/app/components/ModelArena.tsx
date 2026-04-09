import { Trophy } from 'lucide-react';

interface ModelData {
  name: string;
  accuracy: number;
  f1Score: number;
  isBest?: boolean;
}

interface ModelArenaProps {
  models: ModelData[];
}

export function ModelArena({ models }: ModelArenaProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Trophy size={20} />
          Model Arena
        </h2>
        <span className="panel-badge">4 Models</span>
      </div>
      
      <div className="panel-content">
        <div className="model-list">
          {models.map((model, index) => (
            <div key={index} className={`model-item ${model.isBest ? 'best' : ''}`}>
              <div className="model-name">
                <span>{model.name}</span>
                {model.isBest && <span className="best-badge">Best</span>}
              </div>
              <div className="model-metrics">
                <div className="metric">
                  <div className="metric-label">Accuracy</div>
                  <div className="metric-value">{(model.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Weighted F1</div>
                  <div className="metric-value">{model.f1Score.toFixed(3)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
