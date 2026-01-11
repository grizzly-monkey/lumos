import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { ActionHistory } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const groupActionsByDate = (actions: ActionHistory[]) => {
  return actions.reduce((acc, action) => {
    const date = new Date(action.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(action);
    return acc;
  }, {} as Record<string, ActionHistory[]>);
};

export const ActivityReport: React.FC = () => {
  const [groupedActions, setGroupedActions] = useState<Record<string, ActionHistory[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/action-history');
        setGroupedActions(groupActionsByDate(response.data));
      } catch (error) {
        console.error('Failed to fetch action history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overnight Activity Report</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading report...</p>
        ) : (
          // Add a container with fixed height and vertical scroll
          <div className="h-[450px] overflow-y-auto pr-4 space-y-6">
            {Object.entries(groupedActions).map(([date, actions]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-card py-2">
                  {date}
                </h3>
                <ul className="space-y-4">
                  {actions.map((action) => (
                    <li key={action.id} className="flex items-center space-x-3">
                      <div
                        className={`h-6 w-6 rounded-full flex-shrink-0 ${
                          action.success ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div className="flex-grow">
                        <p className="font-medium">{action.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.executedBy.replace('_', ' ')} on{' '}
                          <strong>{action.database.name}</strong>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
