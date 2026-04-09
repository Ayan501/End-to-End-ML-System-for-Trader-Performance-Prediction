import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  value: number;
  max?: number;
  color?: string;
}

export function DonutChart({ value, max = 100, color = '#a855f7' }: DonutChartProps) {
  const percentage = (value / max) * 100;
  const data = [
    { name: 'Value', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];

  const COLORS = [color, 'rgba(255, 255, 255, 0.1)'];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
          {value.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
