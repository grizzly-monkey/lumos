import { Injectable } from '@nestjs/common';
import { GeminiProvider } from './gemini.provider';

@Injectable()
export class AIProviderFactory {
  constructor(private readonly geminiProvider: GeminiProvider) {}

  getProvider() {
    const provider = process.env.AI_PROVIDER;
    switch (provider) {
      case 'gemini':
        return this.geminiProvider;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
