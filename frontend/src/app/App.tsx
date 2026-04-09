import { Database, Users, TrendingUp, Target } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { DonutChart } from './components/DonutChart';
import { SparkLine } from './components/SparkLine';
import { SentimentBars } from './components/SentimentBars';
import { TimelineChart } from './components/TimelineChart';
import { ModelArena } from './components/ModelArena';
import { LiveSnapshot } from './components/LiveSnapshot';
import { PredictionPanel } from './components/PredictionPanel';
import '../styles/dashboard.css';

// Mock Data
const mockSparklineData = {
  sessions: [120, 135, 128, 145, 152, 148, 165, 170],
  accounts: [85, 88, 87, 92, 95, 93, 98, 100],
  winRate: [0.52, 0.54, 0.53, 0.56, 0.58, 0.57, 0.59, 0.60],
};

const sentimentData = [
  { label: 'Extreme Fear', value: 0, color: '#dc2626', pnl: -12500 },
  { label: 'Fear', value: 25, color: '#f97316', pnl: -4200 },
  { label: 'Neutral', value: 50, color: '#eab308', pnl: 2800 },
  { label: 'Greed', value: 75, color: '#22c55e', pnl: 8500 },
  { label: 'Extreme Greed', value: 100, color: '#10b981', pnl: 15300 },
];

const timelineData = [
  { date: 'Mar 15', pnl: 4200, sentiment: 35 },
  { date: 'Mar 18', pnl: 6800, sentiment: 42 },
  { date: 'Mar 21', pnl: 5400, sentiment: 38 },
  { date: 'Mar 24', pnl: 9200, sentiment: 55 },
  { date: 'Mar 27', pnl: 12500, sentiment: 62 },
  { date: 'Mar 30', pnl: 11800, sentiment: 58 },
  { date: 'Apr 2', pnl: 15200, sentiment: 68 },
  { date: 'Apr 5', pnl: 18400, sentiment: 72 },
  { date: 'Apr 8', pnl: 16900, sentiment: 65 },
];

const modelData = [
  { name: 'LogisticRegression', accuracy: 0.712, f1Score: 0.708, isBest: false },
  { name: 'RandomForestClassifier', accuracy: 0.748, f1Score: 0.745, isBest: false },
  { name: 'GradientBoostingClassifier', accuracy: 0.782, f1Score: 0.779, isBest: true },
  { name: 'ExtraTreesClassifier', accuracy: 0.735, f1Score: 0.731, isBest: false },
];

const snapshotData = [
  { label: 'Feature Store Rows', value: '52,847' },
  { label: 'Active Accounts', value: '1,247' },
  { label: 'Avg Win Rate', value: '60.2%' },
  { label: 'Best Model Accuracy', value: '78.2%' },
];

function App() {
  return (
    <div className="dashboard-container">
      <Sidebar activeItem="Dashboard" />
      
      <main className="main-content">
        <Header />
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Sessions Analyzed"
            value="52,847"
            change={12.5}
            icon={<Database size={20} />}
            color="violet"
            chart={<SparkLine data={mockSparklineData.sessions} color="#a855f7" />}
          />
          
          <StatCard
            title="Active Accounts"
            value="1,247"
            change={8.3}
            icon={<Users size={20} />}
            color="cyan"
            chart={<SparkLine data={mockSparklineData.accounts} color="#06b6d4" />}
          />
          
          <StatCard
            title="Avg Win Rate"
            value="60.2%"
            change={5.7}
            icon={<TrendingUp size={20} />}
            color="orange"
            chart={<SparkLine data={mockSparklineData.winRate} color="#fb923c" />}
          />
          
          <StatCard
            title="Model Confidence"
            value="78.2%"
            change={2.1}
            icon={<Target size={20} />}
            color="pink"
            chart={<DonutChart value={78.2} color="#ec4899" />}
          />
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {/* Sentiment Performance */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Sentiment Performance Analysis</h2>
                <span className="panel-badge">5 Buckets</span>
              </div>
              <div className="panel-content">
                <SentimentBars data={sentimentData} />
              </div>
            </div>
            
            {/* Market vs PnL Timeline */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Market Sentiment vs PnL Timeline</h2>
                <span className="panel-badge">Last 30 Days</span>
              </div>
              <div className="panel-content">
                <TimelineChart data={timelineData} />
              </div>
            </div>
            
            {/* Prediction Console */}
            <PredictionPanel />
          </div>
          
          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <LiveSnapshot data={snapshotData} />
            <ModelArena models={modelData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
