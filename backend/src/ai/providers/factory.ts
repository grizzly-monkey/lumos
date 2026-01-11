import { Injectable } from '@nestjs/common';
import { GeminiProvider } from './gemini.provider';
import { ClaudeProvider } from './claude.provider';

@Injectable()
export class AIProviderFactory {
  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly claudeProvider: ClaudeProvider,
  ) {}

  getProvider() {
    const provider = process.env.AI_PROVIDER || 'claude'; // Default to Claude
    switch (provider.toLowerCase()) {
      case 'gemini':
        return this.geminiProvider;
      case 'claude':
        return this.claudeProvider;
      default:
        throw new Error(`Unsupported AI provider: ${provider}. Supported providers: 'gemini', 'claude'`);
    }
  }
}
