import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { Database, Incident, Metric } from '../../types';
import { StatusHeader } from './StatusHeader';
import { MetricsCards } from './MetricsCards';
import { IncidentCards } from './IncidentCards';
import { DatabaseTimeline } from './DatabaseTimeline'; // Import the new component
import { AgentSummary } from './AgentSummary';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const { socket, isConnected } = useWebSocket();
  const [databases, setDatabases] = useState<Database[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDatabases = async () => {
    try {
      const response = await axios.get('/api/databases');
      setDatabases(response.data);
    } catch (error) {
      console.error('Failed to fetch databases:', error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchDatabases(),
          axios.get('/api/incidents').then((res) => setIncidents(res.data)),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    const dbPoller = setInterval(fetchDatabases, 30000);
    return () => clearInterval(dbPoller);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMetricsUpdate = (data: Metric) => {
      setMetrics((prev) => {
        const newMetrics = [data, ...prev];
        return newMetrics.slice(0, 500); 
      });
    };

    const handleIncidentDetected = (data: Incident) => {
      setIncidents((prev) => [data, ...prev]);
    };

    socket.on('metrics_update', handleMetricsUpdate);
    socket.on('incident_detected', handleIncidentDetected);

    return () => {
      socket.off('metrics_update', handleMetricsUpdate);
      socket.off('incident_detected', handleIncidentDetected);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <StatusHeader isConnected={isConnected} />
      <div className="space-y-6 mt-4">
        <AgentSummary />
        
        <MetricsCards metrics={metrics} databases={databases} />

        {/* New Database Timeline View */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-200">Live Database Activity</h2>
          <DatabaseTimeline databases={databases} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-200">Recent Incidents</h2>
          <div className="h-[450px] overflow-y-auto pr-4">
            <IncidentCards incidents={incidents} />
          </div>
        </div>
      </div>
    </div>
  );
};
