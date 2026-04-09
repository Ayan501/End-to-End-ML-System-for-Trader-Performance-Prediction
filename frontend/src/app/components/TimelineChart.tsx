import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TimelineData {
  date: string;
  pnl: number;
  sentiment: number;
}

interface TimelineChartProps {
  data: TimelineData[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <div className="timeline-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#06b6d4"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#a855f7"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(26, 31, 58, 0.95)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              color: '#fff',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.85rem', color: '#cbd5e1' }}
            iconType="line"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="pnl"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ fill: '#06b6d4', r: 4 }}
            activeDot={{ r: 6, fill: '#06b6d4' }}
            name="Total PnL ($)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sentiment"
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ fill: '#a855f7', r: 4 }}
            activeDot={{ r: 6, fill: '#a855f7' }}
            name="Avg Fear & Greed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
