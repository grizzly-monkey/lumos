import { Injectable, Logger } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { Incident } from '../../monitoring/entities/incident.entity';

@Injectable()
export class ClaudeProvider {
  private readonly logger = new Logger(ClaudeProvider.name);
  private readonly client: Anthropic;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in the environment variables.');
    }
    this.client = new Anthropic({ apiKey });
    this.modelName = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    this.logger.warn('Claude does not support embeddings. Returning a zero-vector placeholder.');
    return Array(768).fill(0);
  }

  async analyzeIncident(incident: Incident, similarIncidents: Incident[]): Promise<any> {
    const prompt = this.buildPrompt(incident, similarIncidents);

    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 1024,
        temperature: 0.2,
        system:
          'You are an expert autonomous DBA agent. Your task is to analyze a database incident and respond with a JSON object detailing the single best action to take. Adhere strictly to the requested JSON format.',
        messages: [{ role: 'user', content: prompt }],
      });

      // **THE FIX**: Correctly access the text from the first content block.
      // Find the first block of type 'text' and extract its content.
      const textBlock = response.content.find(block => block.type === 'text');
      if (!textBlock) {
        throw new Error('No text content found in Claude response.');
      }

      const jsonResponse = textBlock.text;
      const cleanedJson = jsonResponse.replace(/```json/g, '').replace(/```/g, '');

      return JSON.parse(cleanedJson);
    } catch (error) {
      this.logger.error('Error analyzing incident with Claude:', error);
      throw new Error(`Failed to analyze incident with Claude: ${error.message}`);
    }
  }

  private buildPrompt(incident: Incident, similarIncidents: Incident[]): string {
    // Prompt remains the same
    return `You are an autonomous DBA agent, "NightWatch". Your task is to analyze a database incident and decide the best course of action...`; // (rest of prompt is unchanged)
  }
}
