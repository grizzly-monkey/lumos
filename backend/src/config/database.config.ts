import { registerAs } from '@nestjs/config';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export default registerAs('database', (): DatabaseConfig => ({  
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  name: process.env.DB_NAME || 'nightwatch_db',
}));
