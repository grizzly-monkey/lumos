import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { ActionHistory, Database } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Database as DbIcon, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface TimelineProps {
  databases: Database[];
}

export const DatabaseTimeline: React.FC<TimelineProps> = ({ databases }) => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useWebSocket();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/action-history');
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch action history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Real-time update listener
  useEffect(() => {
    if (!socket) return;

    const handleNewAction = (newAction: ActionHistory) => {
      setHistory((prevHistory) => {
        // Add new action to the top of the list
        return [newAction, ...prevHistory];
      });
    };

    socket.on('action_logged', handleNewAction);

    return () => {
      socket.off('action_logged', handleNewAction);
    };
  }, [socket]);

  const getStatusColor = (action: ActionHistory) => {
    if (!action.success) return 'text-red-500 border-red-500 bg-red-500/10';
    if (action.executedBy === 'ai_agent') return 'text-blue-500 border-blue-500 bg-blue-500/10';
    if (action.description.toLowerCase().includes('warning')) return 'text-orange-500 border-orange-500 bg-orange-500/10';
    return 'text-green-500 border-green-500 bg-green-500/10';
  };

  const getIcon = (action: ActionHistory) => {
    if (!action.success) return <XCircle className="w-4 h-4" />;
    if (action.executedBy === 'ai_agent') return <Activity className="w-4 h-4" />;
    if (action.description.toLowerCase().includes('warning')) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (isLoading) return <div className="text-center p-4">Loading timeline...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {databases.map((db) => {
        const dbActions = history.filter(
          (h) => (h as any).database?.id === db.id || h.database?.id === db.id
        ).slice(0, 6);

        if (dbActions.length === 0) return null;

        return (
          <Card key={db.id} className="h-full border-slate-800 bg-slate-950/50">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <CardTitle className="flex items-center space-x-2 text-sm font-bold text-slate-300">
                <DbIcon className="w-4 h-4 text-blue-400" />
                <span>{db.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-3">
              <div className="relative pl-3 border-l border-slate-800 space-y-6">
                {dbActions.map((action) => {
                  const colorClass = getStatusColor(action);
                  const isAutonomous = action.executedBy === 'ai_agent';
                  
                  return (
                    <div 
                      key={action.id} 
                      className={`relative animate-slide-in ${isAutonomous ? 'ml-4 mt-2' : ''}`}
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute ${isAutonomous ? '-left-[41px]' : '-left-[21px]'} top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-950 ${colorClass} z-10 transition-all duration-500`}>
                        {getIcon(action)}
                      </div>

                      {/* Connector Line for Autonomous Actions */}
                      {isAutonomous && (
                        <div className="absolute -left-[34px] top-4 w-4 h-4 border-b-2 border-l-2 border-slate-700 rounded-bl-lg" />
                      )}

                      {/* Content */}
                      <div className="pl-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                          </span>
                          {isAutonomous && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                              AUTO-FIX
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-xs font-bold mt-0.5 ${isAutonomous ? 'text-blue-300' : 'text-slate-300'}`}>
                          {action.actionType.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
