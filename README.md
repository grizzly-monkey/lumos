# 💡 Lumos - Intelligent Database Autonomy

## **Illuminating the dark corners of your database.**

LUMOS is an autonomous AI-powered agent that monitors MariaDB databases 24/7, detects issues, and automatically takes corrective actions without human intervention.

## 🎯 Features

- **24/7 Autonomous Monitoring**: Continuous database health checks every 30 seconds.
- **AI-Powered Decision Making**: Uses Gemini/Claude to analyze incidents and decide actions.
- **Vector-Based Pattern Matching**: Learns from past incidents using MariaDB Vector Search.
- **Model Context Protocol (MCP)**: Executes database commands securely via a dedicated MCP server.
- **Automatic Resolution**: Executes DBA tasks automatically (kill queries, create indexes, scale resources).
- **Real-time Dashboard**: Beautiful web interface with live updates via WebSocket.
- **Smart Learning**: Gets better over time by storing incident patterns as vectors.
- **Multi-Database Support**: Monitor multiple databases simultaneously.

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│  React Dashboard (Frontend)  │
└──────────────┬───────────────┘
               │ WebSocket
               ▼
┌──────────────────────────────┐       ┌──────────────────┐
│   LUMOS Backend (NestJS)     │◄─────►│ AI Model (Gemini)│
│  - Monitoring Engine         │       └──────────────────┘
│  - Vector Search Logic       │
└──────┬───────────────┬───────┘
       │               │
       │               │ Tool Call
       │               ▼
       │       ┌────────────────┐
       │       │   MCP Server   │
       │       └───────┬────────┘
       │               │ SQL
       ▼               ▼
┌──────────────────────────────┐
│   MariaDB (Database)         │
│  - Vector Embeddings         │
│  - Operational Data          │
└──────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Gemini API Key (or Claude)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/grizzly-monkey/lumos.git
   cd lumos
   ```

2. **Start the Stack (MariaDB + MCP Server)**
   ```bash
   docker-compose up -d --build
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your GOOGLE_API_KEY
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Initialize database and seed data**
   ```bash
   # Run the setup script directly against the Docker container
   # (Password is 'nightwatch123' by default)
   mysql -h 127.0.0.1 -P 3306 -u nightwatch -p nightwatch_db < backend/scripts/setup-database.sql
   
   ```

6. **Start the application**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

7. **Open dashboard**
   ```
   http://localhost:5173
   ```

## 📊 Automated DBA Tasks

LUMOS automatically handles these tasks:

1. ✅ **Backup Verification** - Checks backup completion and integrity.
2. ✅ **Connection Pool Management** - Kills long queries, scales connections.
3. ✅ **Performance Monitoring** - Tracks metrics vs baseline.
4. ✅ **Index Maintenance** - Rebuilds fragmented indexes.
5. ✅ **Storage Management** - Archives logs when disk is full.
6. ✅ **Deadlock Detection** - Monitors and resolves deadlocks.
7. ✅ **Statistics Updates** - Auto-updates when query plans degrade.
8. ✅ **Log Analysis** - Parses errors and applies known fixes.
9. ✅ **HA/DR Checks** - Monitors replication health.
10. ✅ **Query Optimization** - Suggests and applies optimizations.

## 🤖 AI Providers

LUMOS supports multiple AI providers. Configure in `.env`:

```bash
# Use Gemini (recommended)
AI_PROVIDER=gemini
GOOGLE_API_KEY=your_key_here

# Or Claude
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
```

## 📈 Impact Metrics

Based on simulation data:

- **Time Saved**: 62 hours (1.5 FTE DBAs)
- **Issues Resolved**: 147 incidents auto-fixed
- **Pages Avoided**: 23 midnight alerts prevented
- **Performance Improvements**: 340+ optimizations

## 📝 API Documentation

### REST Endpoints

- `GET /api/status` - Agent status
- `GET /api/databases` - List monitored databases
- `GET /api/metrics/:databaseId` - Database-specific metrics
- `GET /api/incidents` - Recent incidents
- `GET /api/actions` - Recent actions
- `GET /api/action-history` - Full history log
- `GET /api/summary` - Agent impact summary

### WebSocket Events

**Server → Client:**
- `metrics_update` - New metrics data
- `incident_detected` - New incident
- `incident_updated` - Incident resolved/updated
- `action_logged` - New autonomous action or check

## 📚 Resources

- [MariaDB Vector Documentation](https://mariadb.com/kb/en/vector/)
- [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📄 License

MIT License

## 👥 Author

**Jeet**
*Built for MariaDB AI Demo Competition 2026*
