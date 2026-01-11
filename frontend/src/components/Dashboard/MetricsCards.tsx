import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { Metric, Database } from '../../types';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface MetricsCardsProps {
  metrics: Metric[];
  databases: Database[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, databases }) => {
  // Group metrics by database ID
  const metricsByDb = databases.reduce((acc, db) => {
    const dbId = Number(db.id);
    
    const dbMetrics = metrics
      .filter((m) => {
        // Handle both flat 'database_id' and nested 'database.id' structures
        // The backend sends { database: { id: ... } }
        const metricDbId = m.database_id ? Number(m.database_id) : (m as any).database ? Number((m as any).database.id) : null;
        return metricDbId === dbId;
      })
      .map(m => ({
        ...m,
        cpuPercent: Number(m.cpuPercent) || 0,
        memoryPercent: Number(m.memoryPercent) || 0,
      }))
      .reverse();

    acc[dbId] = dbMetrics;
    return acc;
  }, {} as Record<number, Metric[]>);

  if (databases.length === 0) {
    return <div className="text-center text-muted-foreground py-4">Loading databases...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {databases.map((db) => {
        const dbId = Number(db.id);
        const dbMetrics = metricsByDb[dbId] || [];
        const latest = dbMetrics[dbMetrics.length - 1];

        return (
          <Card key={db.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                {db.name}
                <span className={`h-2 w-2 rounded-full ${
                  db.status === 'healthy' ? 'bg-green-500' : 
                  db.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* CPU Metric with Sparkline */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">CPU</span>
                    <span className="font-bold">
                      {latest ? `${latest.cpuPercent.toFixed(1)}%` : '...'}
                    </span>
                  </div>
                  <div className="h-8 bg-slate-900/50 rounded">
                    {dbMetrics.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dbMetrics}>
                          <defs>
                            <linearGradient id={`cpuGradient-${db.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <YAxis domain={[0, 100]} hide />
                          <Area 
                            type="monotone" 
                            dataKey="cpuPercent" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill={`url(#cpuGradient-${db.id})`} 
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Memory Metric with Sparkline */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Memory</span>
                    <span className="font-bold">
                      {latest ? `${latest.memoryPercent.toFixed(1)}%` : '...'}
                    </span>
                  </div>
                  <div className="h-8 bg-slate-900/50 rounded">
                    {dbMetrics.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dbMetrics}>
                          <defs>
                            <linearGradient id={`memGradient-${db.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <YAxis domain={[0, 100]} hide />
                          <Area 
                            type="monotone" 
                            dataKey="memoryPercent" 
                            stroke="#82ca9d" 
                            fillOpacity={1} 
                            fill={`url(#memGradient-${db.id})`} 
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Other Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Conn</div>
                    <div className="font-mono text-sm">
                      {latest ? latest.activeConnections : '-'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Slow Q</div>
                    <div className={`font-mono text-sm ${latest && latest.slowQueriesCount > 0 ? 'text-red-400' : ''}`}>
                      {latest ? latest.slowQueriesCount : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
