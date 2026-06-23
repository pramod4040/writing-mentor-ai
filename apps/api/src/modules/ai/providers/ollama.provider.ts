import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiProvider, AiReviewInput } from '../ai-provider.interface';
import { AiService } from '../ai.service';

@Injectable()
export class OllamaProvider implements AiProvider {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('OLLAMA_BASE_URL') ?? 'http://127.0.0.1:11434';
    this.model = this.config.get<string>('OLLAMA_MODEL') ?? 'llama3.2';
  }

  private async chat(prompt: string, formatJson = true): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        format: formatJson ? 'json' : undefined,
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { message?: { content?: string } };
    const text = data.message?.content;
    if (!text) throw new Error('Ollama returned an empty response');
    return text;
  }

  async generateReviewRaw(input: AiReviewInput): Promise<string> {
    const prompt = AiService.buildPrompt(input);
    return this.chat(prompt);
  }

  async generatePracticeQuestionsRaw(prompt: string): Promise<string> {
    return this.chat(prompt);
  }

  async gradePracticeAnswerRaw(prompt: string): Promise<string> {
    return this.chat(prompt);
  }
}
