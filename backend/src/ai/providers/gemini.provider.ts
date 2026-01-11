import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Incident } from '../../monitoring/entities/incident.entity';

@Injectable()
export class GeminiProvider {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async analyzeIncident(
    incident: Incident,
    similarIncidents: Incident[],
  ): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = this.buildPrompt(incident, similarIncidents);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  private buildPrompt(
    incident: Incident,
    similarIncidents: Incident[],
  ): string {
    return `You are an autonomous DBA agent, "NightWatch". Your task is to analyze a database incident and decide the best course of action.

**Current Incident:**
- **Database:** ${incident.database.name}
- **Issue Type:** ${incident.issueType}
- **Severity:** ${incident.severity}
- **Symptoms:** ${incident.symptoms}
- **Timestamp:** ${incident.timestamp}

**Similar Past Incidents (Successfully Resolved):**
${JSON.stringify(similarIncidents, null, 2)}

**Your Task:**
Respond with a JSON object detailing the single best action to take.

**Available Actions:**
- \`kill_query\`: Terminate a long-running query.
- \`create_index\`: Add a missing index to a table.
- \`rebuild_index\`: Defragment a specified index.
- \`scale_connections\`: Increase the \`max_connections\` limit.
- \`clear_logs\`: Archive and purge old log files.
- \`update_statistics\`: Run \`ANALYZE TABLE\`.
- \`alert_dba\`: Escalate to a human DBA for manual review.

**Rules:**
1.  **Confidence is Key:** Only recommend auto-execution if your confidence is high (>80%) and the risk is low.
2.  **Safety First:** Prefer non-destructive actions. If unsure, \`alert_dba\`.
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
}`;
  }
}
