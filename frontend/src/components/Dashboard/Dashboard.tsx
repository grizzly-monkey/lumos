import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { Database, Incident, Metric } from '../../types';
import { StatusHeader } from './StatusHeader';
import { DatabaseGrid } from './DatabaseGrid';
import { MetricsCards } from './MetricsCards';
import { IncidentCards } from './IncidentCards';
import { ActivityReport } from './ActivityReport'; // Import the new component
import { PerformanceCharts } from './PerformanceCharts';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const { socket, isConnected } = useWebSocket();
  const [databases, setDatabases] = useState<Database[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [dbRes, incRes] = await Promise.all([
          axios.get('/api/databases'),
          axios.get('/api/incidents'),
        ]);
        setDatabases(dbRes.data);
        setIncidents(incRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMetricsUpdate = (data: Metric) => {
      setMetrics((prev) => [data, ...prev.slice(0, 99)]);
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <StatusHeader isConnected={isConnected} />
      <div className="space-y-6 mt-4">
        <DatabaseGrid databases={databases} />
        <MetricsCards metrics={metrics} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceCharts metrics={metrics} />
          </div>
          {/* Replace ActivityFeed with ActivityReport */}
          <ActivityReport />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Incidents</h2>
          <IncidentCards incidents={incidents} />
        </div>
      </div>
    </div>
  );
};
