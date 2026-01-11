import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { ActionHistory, Database } from '../../types';
import { format } from 'date-fns';
import { 
  Database as DbIcon, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Save, 
  Zap, 
  Network, 
  FileText, 
  HardDrive, 
  Lock, 
  Layers, 
  BarChart, 
  RefreshCw 
} from 'lucide-react';
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

  useEffect(() => {
    if (!socket) return;

    const handleNewAction = (newAction: ActionHistory) => {
      setHistory((prevHistory) => {
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
    if (action.description.toLowerCase().includes('warning')) return <AlertTriangle className="w-4 h-4" />;

    switch (action.actionType) {
      case 'backup_verification': return <Save className="w-4 h-4" />;
      case 'database_health_check': return <Activity className="w-4 h-4" />;
      case 'performance_monitoring': return <Zap className="w-4 h-4" />;
      case 'connection_pool_check':
      case 'kill_query': return <Network className="w-4 h-4" />;
      case 'log_analysis': return <FileText className="w-4 h-4" />;
      case 'storage_check':
      case 'clear_logs': return <HardDrive className="w-4 h-4" />;
      case 'deadlock_check':
      case 'deadlock_detected': return <Lock className="w-4 h-4" />;
      case 'index_check':
      case 'rebuild_index': return <Layers className="w-4 h-4" />;
      case 'statistics_check':
      case 'update_statistics': return <BarChart className="w-4 h-4" />;
      case 'ha_dr_check': return <RefreshCw className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading timeline...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {databases.map((db) => {
        // 1. Filter actions for this DB
        const dbActions = history.filter(
          (h) => (h as any).database?.id === db.id || h.database?.id === db.id
        );

        // 2. Group actions using the explicit 'relatedEvent' relationship
        const groupedActions: { event: ActionHistory; action?: ActionHistory }[] = [];
        const processedIds = new Set<number>();

        // We iterate through the list. Since it's sorted DESC (newest first),
        // we will likely encounter the 'action' (child) before the 'event' (parent).
        
        // First pass: Find all autonomous actions and their parents
        const actionMap = new Map<number, ActionHistory>();
        dbActions.forEach(item => {
          if (item.executedBy === 'ai_agent' && item.relatedEvent) {
             // This is a child action. Map it to its parent ID.
             // Note: relatedEvent might be an object or just an ID depending on serialization,
             // but our backend sends the full object.
             actionMap.set(item.relatedEvent.id, item);
             processedIds.add(item.id);
          }
        });

        // Second pass: Build the timeline
        dbActions.forEach(item => {
          if (processedIds.has(item.id)) return; // Skip if already processed as a child

          // Check if this item is a parent to any action
          const childAction = actionMap.get(item.id);
          
          if (childAction) {
            groupedActions.push({ event: item, action: childAction });
          } else {
            groupedActions.push({ event: item });
          }
        });

        // Limit to 6 items for display
        const displayActions = groupedActions.slice(0, 6);

        if (displayActions.length === 0) return null;

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
                {displayActions.map((group) => {
                  const { event, action } = group;
                  const colorClass = getStatusColor(event);
                  
                  return (
                    <div key={event.id} className="relative animate-slide-in">
                      {/* Main Event Dot */}
                      <div className={`absolute -left-[21px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-950 ${colorClass} z-10`}>
                        {getIcon(event)}
                      </div>

                      {/* Main Event Content */}
                      <div className="pl-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {format(new Date(event.timestamp), 'EEE, MMM d • h:mm:ss a')}
                          </span>
                        </div>
                        
                        <p className={`text-xs font-bold mt-0.5 ${!event.success ? 'text-orange-400' : 'text-slate-300'}`}>
                          {event.actionType.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {event.description}
                        </p>

                        {/* Nested Autonomous Action */}
                        {action && (
                          <div className="mt-3 relative">
                            {/* Connector Line */}
                            <div className="absolute -left-[19px] -top-3 w-4 h-4 border-b-2 border-l-2 border-slate-700 rounded-bl-lg" />
                            
                            {/* Action Dot */}
                            <div className="absolute -left-[26px] top-1 w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center z-10">
                              <Activity className="w-3 h-3 text-blue-500" />
                            </div>

                            <div className="pl-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                                  AUTO-FIX APPLIED
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {format(new Date(action.timestamp), 'h:mm:ss a')}
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-300 mt-1 leading-snug">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        )}
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
