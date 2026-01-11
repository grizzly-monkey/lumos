import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface StatusHeaderProps {
  isConnected: boolean;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ isConnected }) => {
  const { socket } = useWebSocket();

  const runDemo = (scenario: string) => {
    if (socket) {
      socket.emit('trigger_demo', { scenario });
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">NightWatch Dashboard</h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <button
          onClick={() => runDemo('slow_query')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          🎬 Run Slow Query Demo
        </button>
      </div>
    </div>
  );
};
