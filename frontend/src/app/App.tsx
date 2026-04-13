import { useState } from 'react';
import { Database, Users, TrendingUp, Target } from 'lucide-react';
import { Sidebar, type PageName } from './components/Sidebar';
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

const pageCopy: Record<PageName, { title: string; subtitle: string }> = {
  Home: {
    title: 'PrimeTrade Overview',
    subtitle: 'A quick project summary for trader behavior, market sentiment, model health, and live prediction readiness.',
  },
  Dashboard: {
    title: 'Analytics Control Room',
    subtitle:
      'Advanced ML prediction system mapping Fear & Greed sentiment with trader behavior patterns. Real-time analysis and next-day PnL bucket prediction powered by ensemble models.',
  },
  Reports: {
    title: 'Reports & Insights',
    subtitle: 'Notebook-backed analysis views for sentiment performance, PnL timelines, and model-ready feature signals.',
  },
  Traders: {
    title: 'Trader Behavior',
    subtitle: 'Account-level trading activity, win-rate signals, and performance snapshots from the merged feature store.',
  },
  Models: {
    title: 'Model Arena',
    subtitle: 'Compare candidate classifiers and keep the best-performing model visible for prediction workflows.',
  },
  Prediction: {
    title: 'Prediction Console',
    subtitle: 'Enter trader and sentiment features to score the next-day PnL bucket.',
  },
  Settings: {
    title: 'Workspace Settings',
    subtitle: 'Project configuration placeholders for API mode, selected model, and dashboard preferences.',
  },
};

function DashboardPage() {
  return (
    <>
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

      <div className="dashboard-grid">
        <div className="page-column">
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Sentiment Performance Analysis</h2>
              <span className="panel-badge">5 Buckets</span>
            </div>
            <div className="panel-content">
              <SentimentBars data={sentimentData} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Market Sentiment vs PnL Timeline</h2>
              <span className="panel-badge">Last 30 Days</span>
            </div>
            <div className="panel-content">
              <TimelineChart data={timelineData} />
            </div>
          </div>

          <PredictionPanel />
        </div>

        <div className="page-column">
          <LiveSnapshot data={snapshotData} />
          <ModelArena models={modelData} />
        </div>
      </div>
    </>
  );
}

function HomePage() {
  return (
    <div className="page-stack">
      <div className="panel page-hero">
        <div>
          <span className="panel-badge">Project Summary</span>
          <h2 className="panel-title page-title">Fear & Greed meets trader behavior</h2>
          <p className="page-copy">
            PrimeTrade combines historical trading sessions, sentiment buckets, and model benchmarks into one analysis flow.
          </p>
        </div>
        <div className="snapshot-list">
          {snapshotData.map((item) => (
            <div className="snapshot-item" key={item.label}>
              <span className="snapshot-label">{item.label}</span>
              <span className="snapshot-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="page-grid-two">
        <ModelArena models={modelData} />
        <LiveSnapshot data={snapshotData} />
      </div>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="page-stack">
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Sentiment Report</h2>
          <span className="panel-badge">Merged View</span>
        </div>
        <SentimentBars data={sentimentData} />
      </div>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">PnL Timeline Report</h2>
          <span className="panel-badge">Last 30 Days</span>
        </div>
        <TimelineChart data={timelineData} />
      </div>
    </div>
  );
}

function TradersPage() {
  return (
    <div className="page-grid-two">
      <LiveSnapshot data={snapshotData} />
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Trader Signals</h2>
          <span className="panel-badge">Accounts</span>
        </div>
        <div className="snapshot-list">
          <div className="snapshot-item">
            <span className="snapshot-label">Trade Count Trend</span>
            <span className="snapshot-value">+12.5%</span>
          </div>
          <div className="snapshot-item">
            <span className="snapshot-label">Buy Ratio Stability</span>
            <span className="snapshot-value">66%</span>
          </div>
          <div className="snapshot-item">
            <span className="snapshot-label">Unique Assets</span>
            <span className="snapshot-value">4 avg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Configuration</h2>
        <span className="panel-badge">Local</span>
      </div>
      <div className="snapshot-list">
        <div className="snapshot-item">
          <span className="snapshot-label">Prediction Mode</span>
          <span className="snapshot-value">Demo Ready</span>
        </div>
        <div className="snapshot-item">
          <span className="snapshot-label">Selected Model</span>
          <span className="snapshot-value">Gradient Boosting</span>
        </div>
        <div className="snapshot-item">
          <span className="snapshot-label">Theme</span>
          <span className="snapshot-value">PrimeTrade Green</span>
        </div>
      </div>
    </div>
  );
}

function renderPage(activePage: PageName) {
  switch (activePage) {
    case 'Home':
      return <HomePage />;
    case 'Reports':
      return <ReportsPage />;
    case 'Traders':
      return <TradersPage />;
    case 'Models':
      return <ModelArena models={modelData} />;
    case 'Prediction':
      return <PredictionPanel />;
    case 'Settings':
      return <SettingsPage />;
    case 'Dashboard':
    default:
      return <DashboardPage />;
  }
}

function App() {
  const [activePage, setActivePage] = useState<PageName>('Dashboard');
  const copy = pageCopy[activePage];

  return (
    <div className="dashboard-container">
      <Sidebar activeItem={activePage} onNavigate={setActivePage} />
      
      <main className="main-content">
        <Header title={copy.title} subtitle={copy.subtitle} />
        {renderPage(activePage)}
      </main>
    </div>
  );
}

export default App;
