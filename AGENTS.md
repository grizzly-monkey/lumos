# NIGHTWATCH - AUTONOMOUS DBA AGENT
## Complete Development Guide for AI Agents (Gemini Optimized)

---

## 🎯 OVERVIEW

This document provides step-by-step instructions for AI agents, particularly **Google's Gemini**, to build the NightWatch Autonomous DBA Agent application from scratch. Each section is designed as a standalone, detailed prompt that can be given to the Gemini API to generate production-quality code.

**Primary Goal:** Create a robust, AI-powered database monitoring and auto-remediation tool using a modern TypeScript stack.

---

## 📋 TABLE OF CONTENTS

1. [**AGENT-1: Project Setup & Structure**](#agent-1-project-setup--structure)
2. [**AGENT-2: Database Schema & Seeding**](#agent-2-database-schema--seeding)
3. [**AGENT-3: Backend - Core Modules & API**](#agent-3-backend---core-modules--api)
4. [**AGENT-4: Backend - AI & Vector Search**](#agent-4-backend---ai--vector-search)
5. [**AGENT-5: Frontend - Dashboard UI**](#agent-5-frontend---dashboard-ui)
6. [**AGENT-6: Real-time Engine with WebSockets**](#agent-6-real-time-engine-with-websockets)
7. [**AGENT-7: Demo Scenarios & Testing**](#agent-7-demo-scenarios--testing)
8. [**AGENT-8: Deployment & Documentation**](#agent-8-deployment--documentation)

---

## AGENT-1: PROJECT SETUP & STRUCTURE

**Prompt for Gemini:**

```
You are an expert software architect. Create a complete project structure for the "NightWatch" Autonomous DBA Agent.

**PROJECT NAME:** `nightwatch-dba-agent`

**TECHNOLOGY STACK:**
- **Backend:** NestJS (Node.js 20+) with TypeScript
- **Frontend:** React 18+ with TypeScript and Vite
- **Database:** MariaDB with Vector extension
- **Real-time:** Socket.io via NestJS Gateway
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

**ACTION:** Generate the complete file and folder structure as defined below. Also, generate the content for all `package.json`, configuration files (`.env.example`, `tsconfig.json`, etc.), and the `docker-compose.yml`.

**PROJECT STRUCTURE:**

```
nightwatch-dba-agent/
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── config/
│   │   │   ├── configuration.ts      # For @nestjs/config
│   │   │   └── database.config.ts    # TypeORM or similar config
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   └── database.providers.ts # MariaDB connection pool provider
│   │   ├── monitoring/
│   │   │   ├── monitoring.module.ts
│   │   │   ├── monitoring.service.ts # Main monitoring engine (Cron Job)
│   │   │   └── entities/             # TypeORM entities (Metric, Incident, etc.)
│   │   ├── ai/
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.service.ts         # AI decision engine
│   │   │   ├── providers/
│   │   │   │   ├── factory.ts
│   │   │   │   ├── gemini.provider.ts
│   │   │   │   └── (claude|openai).provider.ts
│   │   │   └── vector.service.ts     # Vector similarity search
│   │   ├── actions/
│   │   │   ├── actions.module.ts
│   │   │   ├── actions.service.ts    # Executes DBA tasks
│   │   ├── api/
│   │   │   ├── api.module.ts
│   │   │   ├── api.controller.ts     # REST API endpoints
│   │   │   └── api.service.ts
│   │   ├── events/
│   │   │   ├── events.module.ts
│   │   │   └── events.gateway.ts     # WebSocket (Socket.io) gateway
│   │   └── shared/
│   │       ├── dtos/                 # Data Transfer Objects
│   │       └── logger/               # Logging module/service
│   ├── scripts/
│   │   ├── setup-database.sql
│   │   └── seed.ts                 # TypeScript-based seeder
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/
│   ├── (Structure remains the same as original)
│   └── ...
├── docker-compose.yml
├── .gitignore
└── README.md
```

**GENERATE FILE CONTENT:**

**1. `backend/package.json`:**
```json
{
  "name": "nightwatch-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "db:setup": "ts-node scripts/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/schedule": "^3.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "mariadb": "^3.2.0",
    "typeorm": "^0.3.17",
    "socket.io": "^4.7.0",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "@google/generative-ai": "^0.2.1",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/socket.io": "^3.0.2",
    "@types/joi": "^17.2.3",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3",
    "eslint": "^8.42.0",
    "eslint-plugin-prettier": "^4.2.1",
    "prettier": "^2.8.8"
  }
}
```

**2. `backend/.env.example`:**
```
# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_USER=nightwatch
DB_PASSWORD=your_password_here
DB_NAME=nightwatch_db

# AI Provider (gemini, claude, or openai)
AI_PROVIDER=gemini
GOOGLE_API_KEY=your_google_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_key_here
# OPENAI_API_KEY=your_openai_key_here

# Monitoring Engine
MONITOR_INTERVAL_MS=30000
ACTION_CONFIDENCE_THRESHOLD=85
```

**3. `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  mariadb:
    image: mariadb:11.2
    container_name: nightwatch-mariadb
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: rootpassword
      MARIADB_DATABASE: ${DB_NAME:-nightwatch_db}
      MARIADB_USER: ${DB_USER:-nightwatch}
      MARIADB_PASSWORD: ${DB_PASSWORD:-nightwatch123}
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./backend/scripts/setup-database.sql:/docker-entrypoint-initdb.d/init.sql
    command: --plugin-load-add=vector

volumes:
  mariadb_data:
```

**4. `frontend/package.json` (No changes needed, but provided for completeness):**
```json
{
  "name": "nightwatch-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

**IMPORTANT:** Ensure all generated files are complete and follow NestJS and TypeScript best practices. The frontend structure remains unchanged.
```

---

## AGENT-2: DATABASE SCHEMA & SEEDING

**Prompt for Gemini:**

```
You are an expert Database Administrator. Create the database schema and a TypeScript-based data seeding script for the NightWatch project.

**ACTION 1: Create the SQL schema file.**

**FILE:** `backend/scripts/setup-database.sql`

**REQUIREMENTS:**
- Create tables: `databases`, `metrics`, `incidents`, `agent_actions`, `baseline_patterns`.
- Use `VECTOR(768)` for embeddings (optimized for Gemini's `text-embedding-004` model).
- Add appropriate indexes, foreign keys, and comments.
- Ensure tables are created with `IF NOT EXISTS` for idempotency.

```sql
-- SQL SCHEMA FOR NIGHTWATCH --

CREATE DATABASE IF NOT EXISTS nightwatch_db;
USE nightwatch_db;

-- Monitored database instances
CREATE TABLE IF NOT EXISTS `databases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `status` ENUM('healthy', 'warning', 'critical') NOT NULL DEFAULT 'healthy',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='Catalog of monitored database instances';

-- Time-series metrics data
CREATE TABLE IF NOT EXISTS `metrics` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `database_id` INT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `cpu_percent` FLOAT,
  `memory_percent` FLOAT,
  `active_connections` INT,
  `max_connections` INT,
  `slow_queries_count` INT,
  `disk_usage_percent` FLOAT,
  `queries_per_second` FLOAT,
  `avg_query_time_ms` FLOAT,
  INDEX `idx_metrics_timestamp_database` (`timestamp`, `database_id`),
  FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON DELETE CASCADE
) COMMENT='Time-series data for database health monitoring';

-- Detected incidents and anomalies
CREATE TABLE IF NOT EXISTS `incidents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `database_id` INT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `issue_type` VARCHAR(255) NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  `symptoms` TEXT NOT NULL,
  `symptoms_embedding` VECTOR(768),
  `status` ENUM('open', 'investigating', 'resolved', 'failed') NOT NULL DEFAULT 'open',
  `resolved_at` TIMESTAMP NULL,
  `resolution_notes` TEXT,
  INDEX `idx_incidents_type_status` (`issue_type`, `status`),
  FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON DELETE CASCADE
) COMMENT='Records of detected database incidents';

-- Actions taken by the AI agent
CREATE TABLE IF NOT EXISTS `agent_actions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` INT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `action_type` VARCHAR(255) NOT NULL,
  `action_details` TEXT,
  `confidence_score` FLOAT,
  `status` ENUM('pending', 'executing', 'success', 'failed', 'rolled_back'),
  `execution_time_ms` INT,
  `result_notes` TEXT,
  `rollback_plan` TEXT,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE
) COMMENT='Log of all actions performed by the DBA agent';

-- Stored patterns of normal behavior
CREATE TABLE IF NOT EXISTS `baseline_patterns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `database_id` INT NOT NULL,
  `pattern_name` VARCHAR(255) NOT NULL,
  `pattern_data` JSON,
  `pattern_embedding` VECTOR(768),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE `unique_db_pattern` (`database_id`, `pattern_name`),
  FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON DELETE CASCADE
) COMMENT='Learned baseline behavior patterns for anomaly detection';
```

**ACTION 2: Create the TypeScript seeder script.**

**FILE:** `backend/scripts/seed.ts`

**REQUIREMENTS:**
- Use the `mariadb` package to connect.
- Use `dotenv` to load database credentials.
- Generate realistic sample data as described in the original prompt (incidents, metrics, actions, etc.).
- Use batch inserts for performance.
- Log progress to the console.
- Be idempotent: check if data exists before inserting.
- Use a main async function and call it.

```typescript
// scripts/seed.ts
import mariadb from 'mariadb';
import { config } from 'dotenv';
import {- BATCH_SIZE = 1000;

// (Include helper functions for generating random data as in the original prompt)
// e.g., generateRealisticTimestamp, createMetric, createIncident, etc.

async function seed() {
  config({ path: '.env' });

  const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });

  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Database connection successful.');

    // Check and seed databases
    const [dbRows] = await conn.query('SELECT COUNT(*) as count FROM databases');
    if (dbRows.count === 0) {
      console.log('Seeding databases...');
      const dbNames = ['Orders', 'Products', 'Users', 'Analytics'];
      await conn.batch('INSERT INTO databases (name) VALUES (?)', dbNames.map(name => [name]));
      console.log(`✅ Inserted ${dbNames.length} databases.`);
    } else {
      console.log('☑️ Databases table already seeded.');
    }
    
    // ... (Add similar logic for incidents, metrics, and actions) ...
    // Use batch insertion for metrics for performance.
    
    console.log('🎉 Sample data loading complete!');

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

seed();
```
```

---

## AGENT-3: BACKEND - CORE MODULES & API

**Prompt for Gemini:**

```
You are a NestJS expert. Build the core backend modules for the NightWatch application, including the main app, API controller, and monitoring service.

**ACTION: Generate the content for the following files.**

**1. `backend/src/app.module.ts` (Main Module)**
- Import and configure `ConfigModule`, `ScheduleModule`, `DatabaseModule`, `ApiModule`, `EventsModule`, `MonitoringModule`, and `AiModule`.

**2. `backend/src/main.ts` (Application Entrypoint)**
- Enable CORS, configure a global validation pipe, and start the NestJS application.

**3. `backend/src/api/api.controller.ts` (REST Endpoints)**
- Create a controller with endpoints from the original prompt (`/status`, `/databases`, `/metrics`, `/incidents`, etc.).
- Use NestJS decorators (`@Controller`, `@Get`, `@Post`, `@Query`, `@Param`).
- Inject `ApiService` to handle business logic.

**4. `backend/src/api/api.service.ts` (API Business Logic)**
- Implement methods to fetch data from the database (e.g., `getRecentIncidents`, `getMetricsForDatabase`).
- This service will be injected with TypeORM repositories.

**5. `backend/src/monitoring/monitoring.service.ts` (Monitoring Engine)**
- Use the `@Cron()` decorator from `@nestjs/schedule` to run every 30 seconds (`CronExpression.EVERY_30_SECONDS`).
- Implement the main monitoring loop:
  - Fetch all monitored databases.
  - For each database, collect metrics (simulate for now).
  - Analyze metrics for anomalies.
  - If an anomaly is detected, create an incident in the database.
  - Trigger the `AiService` to start the analysis workflow.
  - Emit WebSocket events via the `EventsGateway`.

**EXAMPLE FILE: `backend/src/monitoring/monitoring.service.ts`**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from './entities/database.entity';
import { Incident } from './entities/incident.entity';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(Database)
    private databaseRepository: Repository<Database>,
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    private aiService: AiService,
    private eventsGateway: EventsGateway,
  ) {}

  @Cron(process.env.MONITOR_INTERVAL || CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    this.logger.log('Running monitoring cycle...');
    const databases = await this.databaseRepository.find();
    
    for (const db of databases) {
      const metrics = this.collectMetrics(db);
      this.eventsGateway.broadcast('metrics_update', metrics);
      
      const anomaly = this.detectAnomaly(metrics);
      if (anomaly) {
        const incident = await this.createIncident(db, anomaly);
        this.eventsGateway.broadcast('incident_detected', incident);
        this.aiService.startIncidentAnalysis(incident);
      }
    }
  }

  private collectMetrics(db: Database): any {
    // TODO: Implement real metric collection
    this.logger.log(`Collecting metrics for ${db.name}...`);
    // Simulate metrics for now
    return { database_name: db.name, cpu_percent: Math.random() * 100 };
  }
  
  private detectAnomaly(metrics: any): any | null {
    // TODO: Implement real anomaly detection against baselines
    if (metrics.cpu_percent > 90) {
      return { issue_type: 'high_cpu', severity: 'critical', symptoms: `CPU at ${metrics.cpu_percent}%` };
    }
    return null;
  }

  private async createIncident(db: Database, anomaly: any): Promise<Incident> {
    const newIncident = this.incidentRepository.create({
      database: db,
      issue_type: anomaly.issue_type,
      severity: anomaly.severity,
      symptoms: anomaly.symptoms,
      status: 'open',
    });
    return this.incidentRepository.save(newIncident);
  }
}
```

**IMPORTANT:** Ensure all modules (`.module.ts`), controllers (`.controller.ts`), and services (`.service.ts`) are created with the correct NestJS decorators and dependency injection patterns.
```

---

## AGENT-4: BACKEND - AI & VECTOR SEARCH

**Prompt for Gemini:**

```
You are an AI and NestJS integration specialist. Build the AI decision-making and vector search modules for the NightWatch backend.

**ACTION: Generate the content for the following files.**

**1. `backend/src/ai/ai.module.ts`**
- Define the module, importing necessary dependencies.
- Provide `AiService` and `VectorService`.
- Export `AiService` so other modules (like `MonitoringModule`) can use it.

**2. `backend/src/ai/ai.service.ts` (AI Decision Engine)**
- **`startIncidentAnalysis(incident)`**: The main entry point.
  - **Step 1:** Call `VectorService.findSimilarIncidents()` to get historical context.
  - **Step 2:** Construct a detailed prompt using the template provided below.
  - **Step 3:** Use the `AIProviderFactory` to get the current AI provider (Gemini).
  - **Step 4:** Call the provider's `analyzeIncident()` method.
  - **Step 5:** Validate the JSON response from the AI.
  - **Step 6:** Check confidence score. If it exceeds `ACTION_CONFIDENCE_THRESHOLD`, trigger `ActionsService.executeAction()`. Otherwise, log for manual review.

**3. `backend/src/ai/vector.service.ts` (Vector Search)**
- **`generateEmbedding(text)`**:
  - Use the `AIProviderFactory` to get the AI provider.
  - Call the provider's `generateEmbedding()` method.
  - Implement caching for embeddings to reduce API calls.
- **`findSimilarIncidents(incident)`**:
  - First, call `generateEmbedding()` on the new incident's symptoms.
  - Use TypeORM and MariaDB's `VEC_DISTANCE_COSINE` to find the top 5 most similar resolved incidents from the `incidents` table.
  - Return the matches with their similarity scores.

**4. `backend/src/ai/providers/factory.ts` & Provider Implementations**
- Create the `AIProviderFactory` and the `GeminiProvider` class as described in the original prompt.
- Ensure the `GeminiProvider` uses the `gemini-1.5-pro` model for analysis and `text-embedding-004` for embeddings.
- Implement robust error handling and JSON parsing, especially for the AI's response.

**GEMINI PROMPT TEMPLATE (to be used in `ai.service.ts`):**
```
You are an autonomous DBA agent, "NightWatch". Your task is to analyze a database incident and decide the best course of action.

**Current Incident:**
- **Database:** ${incident.database.name}
- **Issue Type:** ${incident.issue_type}
- **Severity:** ${incident.severity}
- **Symptoms:** ${incident.symptoms}
- **Timestamp:** ${incident.timestamp}

**Similar Past Incidents (Successfully Resolved):**
${JSON.stringify(similarIncidents, null, 2)}

**Your Task:**
Respond with a JSON object detailing the single best action to take.

**Available Actions:**
- `kill_query`: Terminate a long-running query.
- `create_index`: Add a missing index to a table.
- `rebuild_index`: Defragment a specified index.
- `scale_connections`: Increase the `max_connections` limit.
- `clear_logs`: Archive and purge old log files.
- `update_statistics`: Run `ANALYZE TABLE`.
- `alert_dba`: Escalate to a human DBA for manual review.

**Rules:**
1.  **Confidence is Key:** Only recommend auto-execution if your confidence is high (>80%) and the risk is low.
2.  **Safety First:** Prefer non-destructive actions. If unsure, `alert_dba`.
3.  **Provide Details:** Your reasoning and rollback plan are critical.

**RESPONSE FORMAT (JSON ONLY):**
{
  "action": "action_type",
  "reasoning": "A detailed explanation of why this action was chosen based on the current incident and historical data.",
  "risk_level": "low | medium | high",
  "confidence": <A number from 0 to 100>,
  "should_auto_execute": <true | false>,
  "expected_improvement": "Describe the anticipated positive outcome (e.g., 'CPU usage to drop by 50%').",
  "rollback_plan": "A clear, step-by-step plan to undo the action if it fails.",
  "estimated_time_seconds": <Number of seconds the action is expected to take>
}
```

**IMPORTANT:** Structure the AI and Vector services to be injectable and testable. Use async/await throughout and handle potential API errors gracefully.
```

---
## AGENT-5: FRONTEND - DASHBOARD UI

**Prompt for Gemini:**

```
You are a senior frontend developer specializing in React, TypeScript, and data visualization. Build the complete user interface for the NightWatch dashboard.

**ACTION: Generate all frontend files as described in the original prompt.**

The file structure and content for the frontend are excellent as-is in the original prompt. Please generate the following files exactly as specified there, ensuring they are production-ready with proper typing, styling, and component composition:

1.  `frontend/src/types/index.ts`
2.  `frontend/src/hooks/useWebSocket.ts`
3.  `frontend/src/components/shared/Card.tsx`
4.  `frontend/src/components/shared/Badge.tsx`
5.  `frontend/src/components/shared/StatusIndicator.tsx`
6.  `frontend/src/components/Dashboard/StatusHeader.tsx`
7.  `frontend/src/components/Dashboard/MetricsCards.tsx`
8.  `frontend/src/components/Dashboard/ActivityFeed.tsx`
9.  `frontend/src/components/Dashboard/DatabaseGrid.tsx`
10. `frontend/src/components/Dashboard/PerformanceCharts.tsx`
11. `frontend/src/components/Dashboard/IncidentCards.tsx`
12. `frontend/src/components/Dashboard/Dashboard.tsx`
13. `frontend/src/App.tsx`
14. `frontend/src/main.tsx`
15. `frontend/src/index.css`
16. `frontend/tailwind.config.js`
17. `frontend/vite.config.ts`

**KEY IMPROVEMENT for `vite.config.ts`:**
- Update the proxy to point to the new NestJS backend port (3000).

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // <-- UPDATED PORT
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000', // <-- UPDATED PORT
        ws: true,
      },
    },
  },
})
```

**IMPORTANT:** Pay close attention to the real-time data handling in `Dashboard.tsx`. The WebSocket listeners should correctly update the state for metrics, incidents, and actions, making the dashboard feel alive.
```

---

## AGENT-6: REAL-TIME ENGINE WITH WEBSOCKETS

**Prompt for Gemini:**

```
You are a real-time application expert using NestJS. Implement the WebSocket gateway for the NightWatch backend to push live updates to the frontend.

**ACTION: Generate the content for the `events.gateway.ts` and `events.module.ts` files.**

**1. `backend/src/events/events.gateway.ts` (WebSocket Gateway)**
- Use the `@WebSocketGateway` decorator. Configure CORS for the frontend URL.
- Implement the `OnGatewayInit`, `OnGatewayConnection`, and `OnGatewayDisconnect` lifecycle hooks for logging.
- Create a public `broadcast(event, data)` method that emits a message to all connected clients. This will be called by other services (like `MonitoringService`).
- Create a `@SubscribeMessage('trigger_demo')` handler to listen for demo requests from the client.
- Inject the `DemoController` (from Agent-7) to run the requested demo scenario.

```typescript
// backend/src/events/events.gateway.ts
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
// import { DemoController } from '../../scripts/demo-controller'; // To be created

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  // private demoController: DemoController;

  constructor() {
    // this.demoController = new DemoController(this.server);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection_established', { message: 'NightWatch Agent Connected' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('trigger_demo')
  handleDemoTrigger(client: Socket, payload: { scenario: string }): void {
    this.logger.log(`Demo triggered by ${client.id}: ${payload.scenario}`);
    // this.demoController.trigger(payload.scenario);
  }

  /**
   * Broadcasts an event to all connected clients.
   * @param event The event name.
   * @param data The data to send.
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
```

**2. `backend/src/events/events.module.ts`**
- Define the module.
- Provide and export the `EventsGateway`. This allows other services to inject it and call the `broadcast` method.

```typescript
// backend/src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
```

**IMPORTANT:** The `EventsGateway` is the heart of the real-time system. Ensure it's correctly set up to be injected into other services for broadcasting events like `metrics_update`, `incident_detected`, and `action_completed`.
```

---

## AGENT-7: DEMO SCENARIOS & TESTING

**Prompt for Gemini:**

```
You are a testing and automation engineer. Create a powerful, interactive demo controller for the NightWatch application.

**ACTION: Create the `demo.controller.ts` script.**

**FILE:** `backend/src/demo/demo.controller.ts` (This will be a standalone class, not a NestJS controller)

**REQUIREMENTS:**
- Create a `DemoController` class.
- The constructor should accept the `server: Server` (from Socket.io) and TypeORM repositories as arguments.
- Implement the demo scenarios from the original prompt (`slowQueryScenario`, `diskFullScenario`, etc.).
- **Crucially, instead of directly manipulating the database, the methods should call the actual services (`MonitoringService`, `AiService`, `ActionsService`) to simulate a real workflow.**
- Use the `server` instance to emit `demo_step` events to the frontend, showing the agent's "thought process" in real-time.

**EXAMPLE `slowQueryScenario` (Conceptual):**
```typescript
async slowQueryScenario() {
  this.emitStep('Injecting anomalous metrics for a slow query...');
  // 1. Manually create and save a metric that would trigger the anomaly
  await this.metricsRepository.save(anomalousMetric);

  this.emitStep('Triggering monitoring cycle to detect the issue...');
  // 2. Directly call the monitoring service's main method
  await this.monitoringService.handleCron(); 
  // This will detect the anomaly, create an incident, and trigger the AI service.
  // The rest of the flow (AI analysis, action execution) will proceed automatically.

  this.emitStep('Monitoring the resolution...');
  // The frontend will see the incident, the AI's decision, and the action being executed via the normal WebSocket events.
}

private emitStep(message: string) {
  this.server.emit('demo_step', { message });
}
```

**INTEGRATION:**
- The `DemoController` will be instantiated inside the `EventsGateway`.
- The `@SubscribeMessage('trigger_demo')` handler in the gateway will call the appropriate method on the `demoController` instance.

**FRONTEND:**
- Add a "Run Demo" button to the `StatusHeader.tsx` component that, when clicked, uses the WebSocket connection to send a `trigger_demo` event to the backend.

```typescript
// In StatusHeader.tsx, part of the component
const { socket } = useWebSocket();

const runDemo = (scenario: string) => {
  if (socket) {
    socket.emit('trigger_demo', { scenario });
  }
};

// ... in the JSX
<button onClick={() => runDemo('slow_query')}>🎬 Run Slow Query Demo</button>
```

**IMPORTANT:** This approach makes the demo much more realistic, as it tests the actual application logic rather than just simulating events.
```

---

## AGENT-8: DEPLOYMENT & DOCUMENTATION

**Prompt for Gemini:**

```
You are a technical writer and DevOps engineer. Create the final documentation and deployment assets for the NightWatch project.

**ACTION: Generate the root `README.md` and other documentation files.**

**REQUIREMENTS:**
- Update all `README.md` files to reflect the new NestJS architecture.
- Update setup instructions, commands, and project structure diagrams.
- Create a `DEMO_SCRIPT.md` file as detailed in the original prompt.

**FILE 1: `README.md` (Root)**
- **Architecture Diagram:** Update the "Backend" box to say "NestJS" instead of "Node.js".
- **Quick Start:**
  - Change `backend/.env.example` port to `3000`.
  - Change backend setup commands to `npm install` and `npm run start:dev`.
  - Change database seeding command to `npm run db:setup`.
- **Project Structure:** Update the backend folder structure to match the new NestJS layout.

**FILE 2: `backend/README.md`**
- Update all scripts and instructions to be NestJS-specific (`nest build`, `nest start`, etc.).
- Describe the new modular architecture (`MonitoringModule`, `AiModule`, etc.).

**FILE 3: `frontend/README.md`**
- This file should be largely correct, but ensure it's consistent with the rest of the documentation.

**FILE 4: `DEMO_SCRIPT.md`**
- Generate the detailed, 5-7 minute demo script exactly as laid out in the original prompt. It's well-written and provides an excellent narrative for showcasing the project's capabilities.

**EXAMPLE `README.md` QUICK START UPDATE:**

```markdown
## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MariaDB 11.2+ (provided via Docker)
- Gemini API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/nightwatch-dba-agent.git
    cd nightwatch-dba-agent
    ```

2.  **Configure Environment:**
    ```bash
    # Copy the example .env file for the backend
    cp backend/.env.example backend/.env
    
    # Edit backend/.env and add your database password and Gemini API key
    ```

3.  **Start MariaDB via Docker:**
    ```bash
    docker-compose up -d
    ```

4.  **Install Dependencies:**
    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

5.  **Setup & Seed Database:**
    ```bash
    # From the /backend directory
    npm run db:setup
    ```

6.  **Run The Application:**
    ```bash
    # Terminal 1: Start the NestJS backend
    cd backend
    npm run start:dev

    # Terminal 2: Start the React frontend
    cd frontend
    npm run dev
    ```

7.  **Open the Dashboard:**
    Navigate to `http://localhost:5173` in your browser.
```

**IMPORTANT:** Clear, concise, and accurate documentation is crucial for project adoption and maintainability. Double-check all commands and file paths.
```
