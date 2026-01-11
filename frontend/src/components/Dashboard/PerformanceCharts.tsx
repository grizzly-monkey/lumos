import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { Metric } from '../../types';
import { format } from 'date-fns';

interface PerformanceChartsProps {
  metrics: Metric[];
}

const timeFormatter = (time: string) => format(new Date(time), 'HH:mm');

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  metrics,
}) => {
  // Recharts expects data to be in chronological order.
  const chartData = [...metrics].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={timeFormatter}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpuPercent"
                name="CPU Usage"
                stroke="hsl(var(--primary))"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="memoryPercent"
                name="Memory Usage"
                stroke="hsl(var(--secondary-foreground))"
                strokeOpacity={0.6}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Waiting for metric data...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
