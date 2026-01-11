import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../shared/Card';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles } from 'lucide-react';

interface SummaryData {
  status: string;
  monitoredDatabases: number;
  lastActionTime: string | null;
  backupsCompleted: number;
  queriesKilled: number;
  indexesRebuilt: number;
  logsClearedGb: string;
  warningsDetected: number;
  dbaPagesAvoided: number;
  timeSavedHours: string;
}

export const AgentSummary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('/api/summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Failed to fetch agent summary:', error);
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!summary) return null;

  return (
    <Card className="bg-slate-950 text-slate-200 border-slate-800 font-mono text-sm shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <h2 className="text-lg font-bold text-yellow-400 tracking-wider">
                Lumos IntelliAgent
              </h2>
            </div>
            <div className="flex space-x-4 mt-2 text-xs text-slate-400">
              <span>Status: <span className="text-green-400">{summary.status}</span></span>
              <span>|</span>
              <span>Monitoring: <span className="text-white">{summary.monitoredDatabases}</span> databases</span>
              <span>|</span>
              <span>Last Action: <span className="text-white">
                {summary.lastActionTime ? formatDistanceToNow(new Date(summary.lastActionTime), { addSuffix: true }) : 'None'}
              </span></span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <p>✅ <span className="text-white">{summary.backupsCompleted}</span> backups verified</p>
            <p>✅ Auto-killed <span className="text-white">{summary.queriesKilled}</span> runaway queries</p>
            <p>✅ Rebuilt <span className="text-white">{summary.indexesRebuilt}</span> fragmented indexes</p>
            <p>✅ Cleared <span className="text-white">{summary.logsClearedGb}GB</span> of old logs</p>
            
            {summary.warningsDetected > 0 && (
              <p className="text-yellow-400 mt-2">
                ⚠️ WARNING: Detected {summary.warningsDetected} issues requiring attention.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-500">HUMAN INTERVENTION</div>
              <div className="text-xl font-bold text-green-400">0</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">DBA PAGES AVOIDED</div>
              <div className="text-xl font-bold text-blue-400">{summary.dbaPagesAvoided}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">TIME SAVED</div>
              <div className="text-xl font-bold text-purple-400">{summary.timeSavedHours}h</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
