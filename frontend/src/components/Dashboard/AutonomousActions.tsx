import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { ActionHistory } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export const AutonomousActions: React.FC = () => {
  const [actions, setActions] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/action-history');
        // Filter for actions taken by the AI agent
        const agentActions = response.data.filter(
          (action: ActionHistory) => action.executedBy === 'ai_agent',
        );
        setActions(agentActions);
      } catch (error) {
        console.error('Failed to fetch action history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autonomous Actions Log</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading actions...</p>
        ) : (
          <div className="h-[450px] overflow-y-auto pr-4 space-y-4">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <div 
                  key={action.id} 
                  className="flex items-start space-x-3 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex-shrink-0 mt-1 ${
                      action.success ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{action.description}</p>
                    <p className="text-sm text-muted-foreground">
                      On <strong>{action.database.name}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No autonomous actions taken yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
