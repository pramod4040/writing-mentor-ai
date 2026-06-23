import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { MockAiProvider } from './providers/mock.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  providers: [AiService, GeminiProvider, MockAiProvider, OllamaProvider],
  exports: [AiService],
})
export class AiModule {}
