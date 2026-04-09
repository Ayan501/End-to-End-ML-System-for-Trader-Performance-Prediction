import { useState } from 'react';
import { Zap } from 'lucide-react';

interface PredictionFormData {
  trade_count: string;
  total_pnl: string;
  avg_size_usd: string;
  total_fee: string;
  avg_execution_price: string;
  buy_ratio: string;
  long_ratio: string;
  unique_assets: string;
  win_rate: string;
  fg_value: string;
  net_pnl_after_fee: string;
  pnl_per_trade: string;
  size_to_fee_ratio: string;
  sentiment: string;
}

interface PredictionPanelProps {
  onPredict?: (data: PredictionFormData) => Promise<string>;
}

export function PredictionPanel({ onPredict }: PredictionPanelProps) {
  const [formData, setFormData] = useState<PredictionFormData>({
    trade_count: '',
    total_pnl: '',
    avg_size_usd: '',
    total_fee: '',
    avg_execution_price: '',
    buy_ratio: '',
    long_ratio: '',
    unique_assets: '',
    win_rate: '',
    fg_value: '',
    net_pnl_after_fee: '',
    pnl_per_trade: '',
    size_to_fee_ratio: '',
    sentiment: 'Neutral',
  });

  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call or use provided handler
      if (onPredict) {
        const result = await onPredict(formData);
        setPrediction(result);
      } else {
        // Mock prediction logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        const outcomes = ['big_win', 'small_win', 'small_loss', 'big_loss'];
        const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        setPrediction(randomOutcome);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setPrediction('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getResultLabel = (pred: string) => {
    const labels: Record<string, string> = {
      big_win: 'Big Win',
      small_win: 'Small Win',
      small_loss: 'Small Loss',
      big_loss: 'Big Loss',
    };
    return labels[pred] || pred;
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Zap size={20} />
          Prediction Console
        </h2>
        <span className="panel-badge">ML Powered</span>
      </div>
      
      <div className="panel-content">
        <form className="prediction-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Trade Count</label>
            <input
              type="number"
              name="trade_count"
              className="form-input"
              placeholder="e.g., 150"
              value={formData.trade_count}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total PnL</label>
            <input
              type="number"
              name="total_pnl"
              className="form-input"
              placeholder="e.g., 5000"
              value={formData.total_pnl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avg Size USD</label>
            <input
              type="number"
              name="avg_size_usd"
              className="form-input"
              placeholder="e.g., 1200"
              value={formData.avg_size_usd}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Fee</label>
            <input
              type="number"
              name="total_fee"
              className="form-input"
              placeholder="e.g., 45"
              value={formData.total_fee}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avg Execution Price</label>
            <input
              type="number"
              name="avg_execution_price"
              className="form-input"
              placeholder="e.g., 0.00123"
              step="any"
              value={formData.avg_execution_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Buy Ratio</label>
            <input
              type="number"
              name="buy_ratio"
              className="form-input"
              placeholder="e.g., 0.65"
              step="0.01"
              min="0"
              max="1"
              value={formData.buy_ratio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Long Ratio</label>
            <input
              type="number"
              name="long_ratio"
              className="form-input"
              placeholder="e.g., 0.70"
              step="0.01"
              min="0"
              max="1"
              value={formData.long_ratio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unique Assets</label>
            <input
              type="number"
              name="unique_assets"
              className="form-input"
              placeholder="e.g., 8"
              value={formData.unique_assets}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Win Rate</label>
            <input
              type="number"
              name="win_rate"
              className="form-input"
              placeholder="e.g., 0.58"
              step="0.01"
              min="0"
              max="1"
              value={formData.win_rate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">FG Value</label>
            <input
              type="number"
              name="fg_value"
              className="form-input"
              placeholder="e.g., 45"
              value={formData.fg_value}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Net PnL After Fee</label>
            <input
              type="number"
              name="net_pnl_after_fee"
              className="form-input"
              placeholder="e.g., 4955"
              value={formData.net_pnl_after_fee}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PnL Per Trade</label>
            <input
              type="number"
              name="pnl_per_trade"
              className="form-input"
              placeholder="e.g., 33.03"
              step="any"
              value={formData.pnl_per_trade}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Size to Fee Ratio</label>
            <input
              type="number"
              name="size_to_fee_ratio"
              className="form-input"
              placeholder="e.g., 26.67"
              step="any"
              value={formData.size_to_fee_ratio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sentiment</label>
            <select
              name="sentiment"
              className="form-select"
              value={formData.sentiment}
              onChange={handleChange}
              required
            >
              <option value="Extreme Fear">Extreme Fear</option>
              <option value="Fear">Fear</option>
              <option value="Neutral">Neutral</option>
              <option value="Greed">Greed</option>
              <option value="Extreme Greed">Extreme Greed</option>
            </select>
          </div>

          <button
            type="submit"
            className="predict-button"
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Run Prediction'}
          </button>
        </form>

        {prediction && (
          <div className="prediction-result">
            <div className="result-label">Predicted Next-Day PnL Bucket</div>
            <div className={`result-value ${prediction}`}>
              {getResultLabel(prediction)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
