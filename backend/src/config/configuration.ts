interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface AiConfig {
  provider: string;
  googleApiKey: string | undefined;
}

interface MonitoringConfig {
  interval: number;
  actionConfidenceThreshold: number;
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  ai: AiConfig;
  monitoring: MonitoringConfig;
}

export default (): AppConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nightwatch',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    googleApiKey: process.env.GOOGLE_API_KEY,
  },
  monitoring: {
    interval: process.env.MONITOR_INTERVAL_MS 
      ? parseInt(process.env.MONITOR_INTERVAL_MS, 10) 
      : 30000,
    actionConfidenceThreshold: process.env.ACTION_CONFIDENCE_THRESHOLD
      ? parseInt(process.env.ACTION_CONFIDENCE_THRESHOLD, 10)
      : 85,
  },
});
