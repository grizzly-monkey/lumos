import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Incident } from '../../monitoring/entities/incident.entity';

@Injectable()
export class GeminiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly genAI: GoogleGenAI;
  private readonly chatModelName: string = 'gemini-2.5-pro';
  private readonly embeddingModelName = 'gemini-embedding-001';

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set in the environment variables.');
    }
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.genAI.models.embedContent({
        model: this.embeddingModelName,
        contents: text,
      });

      // The new SDK returns an 'embeddings' array. We take the first one.
      const values = result.embeddings?.[0]?.values;
      
      if (!values) {
        throw new Error('No embedding values returned from the API.');
      }
      
      return values;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      // Return a zero vector as a fallback to prevent crashing the app
      return Array(768).fill(0);
    }
  }

  async analyzeIncident(incident: Incident, similarIncidents: Incident[]): Promise<any> {
    const prompt = this.buildPrompt(incident, similarIncidents);

    try {
      const result = await this.genAI.models.generateContent({
        model: this.chatModelName,
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

      if (!result) {
        throw new Error('No AI response received.');
      }
      
      const rawText = result.text;

      if (!rawText) {
        throw new Error('No text found in the AI response.');
      }

      const startIndex = rawText.indexOf('{');
      const endIndex = rawText.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('No valid JSON object found in the AI response.');
      }
      this.logger.log(rawText)

      const jsonString = rawText.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.error('Failed to parse JSON from Gemini response.', {
        error: error.message,
      });
      throw new Error('AI response was not in the expected JSON format.');
    }
  }

  private buildPrompt(incident: Incident, similarIncidents: Incident[]): string {
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
