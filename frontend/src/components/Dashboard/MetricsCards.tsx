import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { Metric } from '../../types';

interface MetricsCardsProps {
  metrics: Metric[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const latestMetric = metrics[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestMetric ? `${latestMetric.cpuPercent.toFixed(2)}%` : '...'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestMetric ? `${latestMetric.memoryPercent.toFixed(2)}%` : '...'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestMetric ? latestMetric.activeConnections : '...'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Slow Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestMetric ? latestMetric.slowQueriesCount : '...'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
