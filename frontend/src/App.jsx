import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

const defaultForm = {
  trade_count: 12,
  total_pnl: 450,
  avg_size_usd: 1800,
  total_fee: 23,
  avg_execution_price: 102000,
  buy_ratio: 0.66,
  long_ratio: 0.58,
  unique_assets: 4,
  win_rate: 0.62,
  fg_value: 35,
  net_pnl_after_fee: 427,
  pnl_per_trade: 37.5,
  size_to_fee_ratio: 75,
  sentiment: "Fear"
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

function SectionHero({ eyebrow, title, subtitle, extra }) {
  return (
    <section className="panel section-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {extra ? <div className="section-hero-extra">{extra}</div> : null}
    </section>
  );
}

function SparklineCard({ title, value, change, accent, points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const normalized = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 100 - ((point - min) / Math.max(max - min, 1)) * 80 - 10;
    return `${x},${y}`;
  });

  return (
    <div className="panel stat-card">
      <div className="panel-topline">
        <span>{title}</span>
        <button className="ghost-chip">Last week</button>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${change >= 0 ? "up" : "down"}`}>{change >= 0 ? "+" : ""}{change}%</div>
      <svg viewBox="0 0 100 100" className="sparkline">
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.65" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke={accent} strokeWidth="3" points={normalized.join(" ")} />
        <polygon
          fill={`url(#grad-${title})`}
          points={`0,100 ${normalized.join(" ")} 100,100`}
        />
      </svg>
    </div>
  );
}

function DonutCard({ title, total, items }) {
  const circumference = 2 * Math.PI * 44;
  let running = 0;

  return (
    <div className="panel donut-card">
      <div className="panel-topline">
        <span>{title}</span>
        <button className="ghost-chip">Today</button>
      </div>
      <div className="donut-wrap">
        <svg viewBox="0 0 120 120" className="donut">
          <circle cx="60" cy="60" r="44" className="donut-bg" />
          {items.map((item) => {
            const segment = (item.value / total) * circumference;
            const dashOffset = circumference - running;
            running += segment;
            return (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r="44"
                className="donut-segment"
                stroke={item.color}
                strokeDasharray={`${segment} ${circumference - segment}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <span>Total</span>
          <strong>{formatNumber(total)}</strong>
        </div>
      </div>
      <div className="legend-list">
        {items.map((item) => (
          <div key={item.label} className="legend-row">
            <span className="dot" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineCard({ data }) {
  const maxPnl = Math.max(...data.map((item) => item.total_pnl));
  const minPnl = Math.min(...data.map((item) => item.total_pnl));
  const lineA = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.total_pnl - minPnl) / Math.max(maxPnl - minPnl, 1)) * 70 - 15;
    return `${x},${y}`;
  });
  const lineB = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.avg_fg_value - 0) / 100) * 70 - 15;
    return `${x},${y}`;
  });

  return (
    <div className="panel timeline-card">
      <div className="panel-topline">
        <span>Market vs PnL</span>
        <button className="ghost-chip">12 snapshots</button>
      </div>
      <svg viewBox="0 0 100 100" className="timeline-chart">
        <polyline fill="none" stroke="#7b5cff" strokeWidth="2.4" points={lineA.join(" ")} />
        <polyline fill="none" stroke="#3dd9ff" strokeWidth="2.4" points={lineB.join(" ")} />
      </svg>
      <div className="timeline-labels">
        {data.map((item) => (
          <span key={item.trade_date}>{item.trade_date.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}

function SentimentBars({ rows }) {
  const max = Math.max(...rows.map((row) => row.avg_pnl), 1);

  return (
    <div className="panel bars-card">
      <div className="panel-topline">
        <span>Sentiment Performance</span>
        <button className="ghost-chip">Merged view</button>
      </div>
      <div className="bar-stack">
        {rows.map((row) => (
          <div key={row.sentiment} className="bar-row">
            <div className="bar-meta">
              <span>{row.sentiment}</span>
              <strong>{formatNumber(row.avg_pnl)}</strong>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.max((row.avg_pnl / max) * 100, 14)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelList({ models, bestModelName }) {
  return (
    <div className="panel pages-card">
      <div className="panel-topline">
        <span>Model Arena</span>
        <button className="ghost-chip">Benchmark</button>
      </div>
      <div className="model-list">
        {models.map((model) => (
          <div className="model-row" key={model.name}>
            <div>
              <strong>{model.name}</strong>
              <p>{model.name === bestModelName ? "Selected best model" : "Candidate model"}</p>
            </div>
            <div className="model-metrics">
              <span>Acc {model.accuracy}%</span>
              <span>F1 {model.f1}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightGallery({ charts }) {
  return (
    <div className="panel gallery-card">
      <div className="panel-topline">
        <span>Project Insight Walls</span>
        <button className="ghost-chip">Mapped outputs</button>
      </div>
      <div className="gallery-grid">
        {charts.map((chart) => (
          <article className="gallery-item" key={chart.file}>
            <div className="gallery-thumb-wrap">
              <img className="gallery-thumb" src={chart.url} alt={chart.title} />
            </div>
            <div className="gallery-copy">
              <strong>{chart.title}</strong>
              <p>{chart.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PredictionPanel({ defaults }) {
  const [form, setForm] = useState({ ...defaultForm, ...defaults });
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaults) {
      setForm((current) => ({ ...current, ...defaults }));
    }
  }, [defaults]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setPrediction("");

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([key, value]) => [
              key,
              key === "sentiment" ? value : Number(value)
            ])
          )
        )
      });
      const result = await response.json();
      setPrediction(result.prediction);
    } catch (error) {
      setPrediction("prediction_failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel prediction-card">
      <div className="prediction-header">
        <div>
          <span className="eyebrow">Prediction Console</span>
          <h3>Live next-day PnL bucket</h3>
        </div>
        <div className="status-pill">{loading ? "Scoring..." : "Model Ready"}</div>
      </div>
      <form className="prediction-grid" onSubmit={handleSubmit}>
        {Object.entries(form).map(([key, value]) => (
          <label className="field" key={key}>
            <span>{key.replaceAll("_", " ")}</span>
            {key === "sentiment" ? (
              <select value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })}>
                {["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed", "Unknown"].map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                step="any"
                value={value}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            )}
          </label>
        ))}
        <button className="predict-button" type="submit">
          Run prediction
        </button>
      </form>
      <div className="prediction-result">
        <span>Predicted bucket</span>
        <strong>{prediction || "Waiting for input"}</strong>
      </div>
    </div>
  );
}

function HomePage({ stats, models, charts }) {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Overview"
        title="PrimeTrade project overview"
        subtitle="End-to-end ML analytics workspace with live trader scoring, sentiment analysis, and model benchmarking."
        extra={
          <div className="hero-chip-row">
            {stats.slice(0, 4).map((item) => (
              <div className="hero-chip" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}{item.label.includes("Rate") || item.label.includes("Accuracy") ? "%" : ""}</strong>
              </div>
            ))}
          </div>
        }
      />
      <div className="page-grid-two">
        <ModelList models={models} bestModelName={models[0]?.name} />
        <InsightGallery charts={charts.slice(0, 2)} />
      </div>
    </div>
  );
}

function ReportsPage({ charts }) {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Reports"
        title="Project reports and output visuals"
        subtitle="All notebook-generated analysis charts mapped into a clean visual gallery."
      />
      <InsightGallery charts={charts} />
    </div>
  );
}

function ModelsPage({ models, bestModelName }) {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Models"
        title="Model comparison arena"
        subtitle="Compare candidate models, benchmark accuracy, and review the selected best model."
      />
      <ModelList models={models} bestModelName={bestModelName} />
    </div>
  );
}

function PredictionPage({ defaults }) {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Prediction"
        title="Live next-day PnL prediction"
        subtitle="Enter merged trader and sentiment features to predict the next-day performance bucket."
      />
      <PredictionPanel defaults={defaults} />
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Settings"
        title="Workspace settings"
        subtitle="This screen can later be connected to theme, API, model version, and deployment controls."
        extra={
          <div className="settings-list">
            <div className="settings-row">
              <span>Theme</span>
              <strong>Dark analytics</strong>
            </div>
            <div className="settings-row">
              <span>Prediction source</span>
              <strong>Local Flask API</strong>
            </div>
            <div className="settings-row">
              <span>Model mode</span>
              <strong>Best saved artifact</strong>
            </div>
          </div>
        }
      />
    </div>
  );
}

function DashboardPage({ dashboard, stats, sentimentRows, timeline, models, charts }) {
  return (
    <>
      <section className="stats-row">
        <SparklineCard title="Sessions" value={stats[0]?.value ?? 0} change={12.6} accent="#ff9d2f" points={[12, 48, 34, 60, 55, 72, 58]} />
        <SparklineCard title="Accounts" value={stats[1]?.value ?? 0} change={23.3} accent="#ff4f8b" points={[22, 25, 31, 28, 42, 39, 52]} />
        <SparklineCard title="Win rate" value={`${stats[2]?.value ?? 0}%`} change={8.9} accent="#3dd9ff" points={[18, 24, 36, 40, 35, 47, 58]} />
        <DonutCard
          title="Prediction confidence"
          total={545}
          items={[
            { label: "Loss zone", value: 30, color: "#ff5b6e" },
            { label: "Neutral", value: 18, color: "#ff9f43" },
            { label: "Win zone", value: 52, color: "#7b5cff" }
          ]}
        />
      </section>

      <section className="content-grid">
        <div className="left-grid">
          <SentimentBars rows={sentimentRows} />
          <TimelineCard data={timeline.length ? timeline : [{ trade_date: "2026-01-01", total_pnl: 0, avg_fg_value: 0 }, { trade_date: "2026-02-01", total_pnl: 0, avg_fg_value: 0 }]} />
          <InsightGallery charts={charts} />
          <PredictionPanel defaults={dashboard?.prediction_defaults} />
        </div>
        <div className="right-grid">
          <div className="panel realtime-card">
            <div className="panel-topline">
              <span>Live Snapshot</span>
              <button className="ghost-chip">Now</button>
            </div>
            <div className="metric-stack">
              {stats.map((item) => (
                <div className="metric-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}{item.label.includes("Rate") || item.label.includes("Accuracy") ? "%" : ""}</strong>
                </div>
              ))}
            </div>
          </div>
          <ModelList models={models} bestModelName={dashboard?.best_model_name} />
        </div>
      </section>
    </>
  );
}

function UsersPage({ stats, sentimentRows }) {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Users"
        title="Trader behavior overview"
        subtitle="High-level trader behavior signals aggregated from account-date level features."
      />
      <div className="page-grid-two">
        <div className="panel realtime-card">
          <div className="panel-topline">
            <span>Trader snapshot</span>
            <button className="ghost-chip">Accounts</button>
          </div>
          <div className="metric-stack">
            {stats.map((item) => (
              <div className="metric-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}{item.label.includes("Rate") || item.label.includes("Accuracy") ? "%" : ""}</strong>
              </div>
            ))}
          </div>
        </div>
        <SentimentBars rows={sentimentRows} />
      </div>
    </div>
  );
}

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((data) => setDashboard(data))
      .catch(() => {
        setDashboard({
          headline: {
            title: "PrimeTrade Analytics Control Room",
            subtitle: "Fear & Greed sentiment mapped with trader behavior and live PnL-bucket prediction."
          },
          stats: [],
          sentiment_breakdown: [],
          timeline: [],
          model_cards: [],
          best_model_name: "",
          prediction_defaults: defaultForm,
          chart_gallery: []
        });
      });
  }, []);

  const stats = dashboard?.stats ?? [];
  const sentimentRows = dashboard?.sentiment_breakdown ?? [];
  const timeline = dashboard?.timeline ?? [];
  const models = dashboard?.model_cards ?? [];
  const charts = dashboard?.chart_gallery ?? [];
  const routeTitleMap = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/reports": "Reports",
    "/users": "Users",
    "/models": "Models",
    "/prediction": "Prediction",
    "/settings": "Settings"
  };
  const activePage = routeTitleMap[location.pathname] ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">VALUE</span>
          <small>ANALYTICS</small>
        </div>
        <nav className="nav-list">
          {[
            { label: "Home", to: "/" },
            { label: "Dashboard", to: "/dashboard" },
            { label: "Reports", to: "/reports" },
            { label: "Users", to: "/users" },
            { label: "Models", to: "/models" },
            { label: "Prediction", to: "/prediction" },
            { label: "Settings", to: "/settings" }
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="theme-dot orange" />
          <span className="theme-dot pink" />
          <span className="theme-dot muted" />
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">PrimeTrade ML Dashboard</p>
            <h1>{activePage === "Dashboard" ? dashboard?.headline?.title ?? "Loading dashboard..." : activePage}</h1>
            <p className="subtitle">
              {activePage === "Dashboard"
                ? dashboard?.headline?.subtitle
                : "Navigate across project sections, reports, models, and live prediction tools."}
            </p>
          </div>
          <div className="topbar-actions">
            <div className="search-pill">Search analytics</div>
            <div className="profile-pill">
              <div className="avatar">PT</div>
              <div>
                <strong>PrimeTrade Lab</strong>
                <span>Analytics squad</span>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage stats={stats} models={models} charts={charts} />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                dashboard={dashboard}
                stats={stats}
                sentimentRows={sentimentRows}
                timeline={timeline}
                models={models}
                charts={charts}
              />
            }
          />
          <Route path="/reports" element={<ReportsPage charts={charts} />} />
          <Route path="/users" element={<UsersPage stats={stats} sentimentRows={sentimentRows} />} />
          <Route
            path="/models"
            element={<ModelsPage models={models} bestModelName={dashboard?.best_model_name} />}
          />
          <Route path="/prediction" element={<PredictionPage defaults={dashboard?.prediction_defaults} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="*"
            element={
              <DashboardPage
                dashboard={dashboard}
                stats={stats}
                sentimentRows={sentimentRows}
                timeline={timeline}
                models={models}
                charts={charts}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
