import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiProvider, AiReviewInput } from '../ai-provider.interface';
import { AiService } from '../ai.service';

@Injectable()
export class GeminiProvider implements AiProvider {
  private client: GoogleGenerativeAI | null = null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.model = this.config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';
  }

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = this.config.getOrThrow<string>('GEMINI_API_KEY');
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  private async generateJson(prompt: string): Promise<string> {
    const model = this.getClient().getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error('Gemini returned an empty response');
    return text;
  }

  async generateReviewRaw(input: AiReviewInput): Promise<string> {
    const prompt = AiService.buildPrompt(input);
    return this.generateJson(prompt);
  }

  async generatePracticeQuestionsRaw(prompt: string): Promise<string> {
    return this.generateJson(prompt);
  }

  async gradePracticeAnswerRaw(prompt: string): Promise<string> {
    return this.generateJson(prompt);
  }
}
