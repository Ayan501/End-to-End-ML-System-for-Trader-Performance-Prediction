import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
  data: number[];
  color?: string;
}

export function SparkLine({ data, color = '#a855f7' }: SparkLineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
