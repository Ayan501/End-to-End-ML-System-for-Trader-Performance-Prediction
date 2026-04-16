import { useEffect, useState } from 'react';
import { Database, Users, TrendingUp, Target, LockKeyhole } from 'lucide-react';
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
import { DataUploadPanel } from './components/DataUploadPanel';
import '../styles/dashboard.css';

// Mock Data
const mockSparklineData = {
  sessions: [0, 0, 0, 0, 0, 0, 0, 0],
  accounts: [0, 0, 0, 0, 0, 0, 0, 0],
  winRate: [0, 0, 0, 0, 0, 0, 0, 0],
};

const sentimentData = [
  { label: 'Extreme Fear', value: 0, color: '#dc2626', pnl: 0 },
  { label: 'Fear', value: 0, color: '#f97316', pnl: 0 },
  { label: 'Neutral', value: 0, color: '#eab308', pnl: 0 },
  { label: 'Greed', value: 0, color: '#22c55e', pnl: 0 },
  { label: 'Extreme Greed', value: 0, color: '#10b981', pnl: 0 },
];

const timelineData = [
  { date: 'No data', pnl: 0, sentiment: 0 },
];

const modelData = [
  { name: 'LogisticRegression', accuracy: 0, f1Score: 0, isBest: false },
  { name: 'RandomForestClassifier', accuracy: 0, f1Score: 0, isBest: false },
  { name: 'GradientBoostingClassifier', accuracy: 0, f1Score: 0, isBest: false },
  { name: 'ExtraTreesClassifier', accuracy: 0, f1Score: 0, isBest: false },
];

const snapshotData = [
  { label: 'Feature Store Rows', value: '0' },
  { label: 'Active Accounts', value: '0' },
  { label: 'Avg Win Rate', value: '0%' },
  { label: 'Best Model Accuracy', value: '0%' },
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
  Upload: {
    title: 'File Intelligence',
    subtitle: 'Upload CSV or Excel data, turn it into charts, and run ML-backed decision signals when model columns are present.',
  },
  Settings: {
    title: 'Workspace Settings',
    subtitle: 'Project configuration placeholders for API mode, selected model, and dashboard preferences.',
  },
};

interface UserSession {
  name: string;
  email: string;
  token: string;
  hasProjectData: boolean;
}

interface DashboardApiData {
  stats: Array<{ label: string; value: number }>;
  sentiment_breakdown: Array<{ sentiment: string; avg_pnl: number; avg_win_rate: number; trades: number }>;
  timeline: Array<{ trade_date: string; total_pnl: number; avg_fg_value: number }>;
  model_cards: Array<{ name: string; accuracy: number; f1: number; train_accuracy: number }>;
  best_model_name: string;
  model_metadata?: {
    model_name: string;
    accuracy: number;
    model_updated_at: string;
  };
  prediction_defaults?: Record<string, string | number>;
}

const sentimentColors: Record<string, string> = {
  'Extreme Fear': '#dc2626',
  Fear: '#f97316',
  Neutral: '#eab308',
  Greed: '#22c55e',
  'Extreme Greed': '#10b981',
};

function formatDashboardDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardApiData | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/dashboard')
      .then((response) => response.json())
      .then((payload) => {
        if (isMounted) setDashboardData(payload);
      })
      .catch(() => {
        if (isMounted) setDashboardData(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return dashboardData;
}

function buildSnapshotData(dashboardData: DashboardApiData | null) {
  if (!dashboardData) return snapshotData;

  return dashboardData.stats.map((stat) => ({
    label: stat.label,
    value: stat.label.toLowerCase().includes('rate') || stat.label.toLowerCase().includes('accuracy')
      ? `${stat.value}%`
      : stat.value.toLocaleString(),
  }));
}

function buildModelData(dashboardData: DashboardApiData | null) {
  if (!dashboardData) return modelData;

  return dashboardData.model_cards.map((model) => ({
    name: model.name,
    accuracy: model.accuracy / 100,
    f1Score: model.f1 / 100,
    isBest: model.name === dashboardData.best_model_name,
  }));
}

function buildSentimentData(dashboardData: DashboardApiData | null) {
  if (!dashboardData) return sentimentData;

  return dashboardData.sentiment_breakdown.map((item) => ({
    label: item.sentiment,
    value: Math.round(item.avg_win_rate * 100),
    color: sentimentColors[item.sentiment] || '#10b981',
    pnl: Math.round(item.avg_pnl),
  }));
}

function buildTimelineData(dashboardData: DashboardApiData | null) {
  if (!dashboardData) return timelineData;

  return dashboardData.timeline.map((item) => ({
    date: formatDashboardDate(item.trade_date),
    pnl: Math.round(item.total_pnl),
    sentiment: Math.round(item.avg_fg_value),
  }));
}

function DashboardPage({ dashboardData }: { dashboardData: DashboardApiData | null }) {
  const liveSnapshot = buildSnapshotData(dashboardData);
  const liveModels = buildModelData(dashboardData);
  const liveSentiments = buildSentimentData(dashboardData);
  const liveTimeline = buildTimelineData(dashboardData);
  const bestAccuracy = dashboardData?.model_metadata?.accuracy ?? 0;

  return (
    <>
      <div className="stats-grid">
        <StatCard
          title="Sessions Analyzed"
          value={liveSnapshot[0]?.value || '0'}
          change={0}
          icon={<Database size={20} />}
          color="violet"
          chart={<SparkLine data={mockSparklineData.sessions} color="#a855f7" />}
        />

        <StatCard
          title="Active Accounts"
          value={liveSnapshot[1]?.value || '0'}
          change={0}
          icon={<Users size={20} />}
          color="cyan"
          chart={<SparkLine data={mockSparklineData.accounts} color="#06b6d4" />}
        />

        <StatCard
          title="Avg Win Rate"
          value={liveSnapshot[2]?.value || '0%'}
          change={0}
          icon={<TrendingUp size={20} />}
          color="orange"
          chart={<SparkLine data={mockSparklineData.winRate} color="#fb923c" />}
        />

        <StatCard
          title="Model Confidence"
          value={`${bestAccuracy}%`}
          change={0}
          icon={<Target size={20} />}
          color="pink"
          chart={<DonutChart value={bestAccuracy} color="#ec4899" />}
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
              <SentimentBars data={liveSentiments} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Market Sentiment vs PnL Timeline</h2>
              <span className="panel-badge">Last 30 Days</span>
            </div>
            <div className="panel-content">
              <TimelineChart data={liveTimeline} />
            </div>
          </div>

          <PredictionPanel onPredict={runPrediction} initialData={dashboardData?.prediction_defaults} />
        </div>

        <div className="page-column">
          <LiveSnapshot data={liveSnapshot} />
          <ModelArena models={liveModels} />
        </div>
      </div>
    </>
  );
}

function HomePage({ dashboardData }: { dashboardData: DashboardApiData | null }) {
  const liveSnapshot = buildSnapshotData(dashboardData);
  const liveModels = buildModelData(dashboardData);

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
          {liveSnapshot.map((item) => (
            <div className="snapshot-item" key={item.label}>
              <span className="snapshot-label">{item.label}</span>
              <span className="snapshot-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="page-grid-two">
        <ModelArena models={liveModels} />
        <LiveSnapshot data={liveSnapshot} />
      </div>
    </div>
  );
}

function ReportsPage({ dashboardData }: { dashboardData: DashboardApiData | null }) {
  const liveSentiments = buildSentimentData(dashboardData);
  const liveTimeline = buildTimelineData(dashboardData);

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Sentiment Report</h2>
          <span className="panel-badge">Merged View</span>
        </div>
        <SentimentBars data={liveSentiments} />
      </div>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">PnL Timeline Report</h2>
          <span className="panel-badge">Last 30 Days</span>
        </div>
        <TimelineChart data={liveTimeline} />
      </div>
    </div>
  );
}

function TradersPage({ dashboardData }: { dashboardData: DashboardApiData | null }) {
  const liveSnapshot = buildSnapshotData(dashboardData);

  return (
    <div className="page-grid-two">
      <LiveSnapshot data={liveSnapshot} />
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Trader Signals</h2>
          <span className="panel-badge">Accounts</span>
        </div>
        <div className="snapshot-list">
          <div className="snapshot-item">
            <span className="snapshot-label">Trade Count Trend</span>
            <span className="snapshot-value">0%</span>
          </div>
          <div className="snapshot-item">
            <span className="snapshot-label">Buy Ratio Stability</span>
            <span className="snapshot-value">0%</span>
          </div>
          <div className="snapshot-item">
            <span className="snapshot-label">Unique Assets</span>
            <span className="snapshot-value">0 avg</span>
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
          <span className="snapshot-value">0</span>
        </div>
        <div className="snapshot-item">
          <span className="snapshot-label">Selected Model</span>
          <span className="snapshot-value">0</span>
        </div>
        <div className="snapshot-item">
          <span className="snapshot-label">Theme</span>
          <span className="snapshot-value">0</span>
        </div>
      </div>
    </div>
  );
}

async function runPrediction(data: Record<string, string>) {
  const numericFields = [
    'trade_count',
    'total_pnl',
    'avg_size_usd',
    'total_fee',
    'avg_execution_price',
    'buy_ratio',
    'long_ratio',
    'unique_assets',
    'win_rate',
    'fg_value',
    'net_pnl_after_fee',
    'pnl_per_trade',
    'size_to_fee_ratio',
  ];
  const payload = { ...data };
  numericFields.forEach((field) => {
    payload[field] = Number(data[field] || 0) as unknown as string;
  });

  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Prediction request failed');
  }

  const result = await response.json();
  return result;
}

function LoginPage({ onLogin }: { onLogin: (session: UserSession) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('PrimeTrade User');
  const [email, setEmail] = useState('admin@primetrade.local');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Login failed');
      }

      const session = {
        name: payload.user.name,
        email: payload.user.email,
        token: payload.token,
        hasProjectData: Boolean(payload.user.has_project_data),
      };
      localStorage.setItem('primetrade-session', JSON.stringify(session));
      onLogin(session);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-mark">
          <LockKeyhole size={28} />
        </div>
        <span className="panel-badge">Secure Workspace</span>
        <h1>{mode === 'login' ? 'PrimeTrade Login' : 'Create Account'}</h1>
        <p>
          {mode === 'login'
            ? 'Existing account se sign in karo.'
            : 'New account zero dashboard se start hoga.'}
        </p>

        {mode === 'register' && (
          <label className="form-group">
            <span className="form-label">Name</span>
            <input className="form-input" type="text" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        )}

        <label className="form-group">
          <span className="form-label">Email</span>
          <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="form-group">
          <span className="form-label">Password</span>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p className="upload-error">{error}</p>}

        <button className="predict-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        <button
          className="auth-switch-button"
          type="button"
          onClick={() => {
            setError('');
            setMode(mode === 'login' ? 'register' : 'login');
          }}
        >
          {mode === 'login' ? 'Create an account' : 'Use existing account'}
        </button>
      </form>
    </main>
  );
}

function renderPage(activePage: PageName, dashboardData: DashboardApiData | null) {
  switch (activePage) {
    case 'Home':
      return <HomePage dashboardData={dashboardData} />;
    case 'Reports':
      return <ReportsPage dashboardData={dashboardData} />;
    case 'Traders':
      return <TradersPage dashboardData={dashboardData} />;
    case 'Models':
      return <ModelArena models={buildModelData(dashboardData)} />;
    case 'Prediction':
      return <PredictionPanel onPredict={runPrediction} initialData={dashboardData?.prediction_defaults} />;
    case 'Upload':
      return <DataUploadPanel />;
    case 'Settings':
      return <SettingsPage />;
    case 'Dashboard':
    default:
      return <DashboardPage dashboardData={dashboardData} />;
  }
}

function App() {
  const [activePage, setActivePage] = useState<PageName>('Dashboard');
  const [session, setSession] = useState<UserSession | null>(null);
  const dashboardData = useDashboardData();
  const visibleDashboardData = session?.hasProjectData ? dashboardData : null;
  const copy = pageCopy[activePage];

  useEffect(() => {
    const savedSession = localStorage.getItem('primetrade-session');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSession({
        ...parsedSession,
        hasProjectData:
          parsedSession.hasProjectData ?? parsedSession.email === 'admin@primetrade.local',
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('primetrade-session');
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar activeItem={activePage} onNavigate={setActivePage} />
      
      <main className="main-content">
        <Header title={copy.title} subtitle={copy.subtitle} userName={session.name} onLogout={handleLogout} />
        {renderPage(activePage, visibleDashboardData)}
      </main>
    </div>
  );
}

export default App;
