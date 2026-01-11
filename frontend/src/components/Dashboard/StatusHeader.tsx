import React from 'react';
import { Lightbulb } from 'lucide-react';

interface StatusHeaderProps {
  isConnected: boolean;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ isConnected }) => {
  return (
    <div className="flex justify-between items-center mb-6 bg-card p-4 rounded-lg border shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-yellow-500/10 rounded-full">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lumos</h1>
          <p className="text-sm text-muted-foreground">
            Auto illuminating dark corners of your database.
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-background rounded-full border">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-xs font-medium">
            {isConnected ? 'System Online' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};
