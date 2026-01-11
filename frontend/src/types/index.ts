export interface Database {
  id: number;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  createdAt: string;
}

// Corrected to use camelCase to match the API response
export interface Metric {
  id: number;
  database_id: number; // This is often a foreign key, keeping as is.
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  activeConnections: number;
  maxConnections: number;
  slowQueriesCount: number;
  diskUsagePercent: number;
  queriesPerSecond: number;
  avgQueryTimeMs: number;
}

// Corrected to use camelCase
export interface Incident {
  id: number;
  database_id: number;
  timestamp: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string;
  status: 'open' | 'investigating' | 'resolved' | 'failed';
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

// Corrected to use camelCase
export interface AgentAction {
  id: number;
  incident_id: number;
  timestamp: string;
  actionType: string;
  actionDetails: string;
  confidenceScore: number;
  status: 'pending' | 'executing' | 'success' | 'failed' | 'rolled_back';
  executionTimeMs: number | null;
  resultNotes: string | null;
  rollbackPlan: string | null;
}

export interface ActionHistory {
  id: number;
  timestamp: string;
  database: Database;
  actionType: string;
  description: string;
  executedBy: string;
  success: boolean;
  details: any;
}
