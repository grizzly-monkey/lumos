import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { AgentAction } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  actions: AgentAction[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ actions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {actions.map((action) => (
            <li key={action.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {/* Icon can go here */}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">{action.actionType}</p>
                <p className="text-sm text-gray-500">{action.actionDetails}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(action.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
