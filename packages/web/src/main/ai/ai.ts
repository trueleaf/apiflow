import { config } from '../../config/config';

type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type AiChoice = {
  message?: {
    content?: string;
  };
  content?: string;
};

type AiResponse = {
  choices?: AiChoice[];
};

type ChatRequestPayload = {
  model: 'DeepSeek';
  messages: ChatMessage[];
  max_output_tokens?: number;
};

export class aiManager {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = config.aiConfig.apiUrl;
    this.apiKey = config.aiConfig.apiKey;
  }

  public async chatWithJsonText(prompt: string[], model: 'DeepSeek', resLimitSize = 2000): Promise<string> {
    const baseMessages = this.buildMessages(prompt, this.buildSystemPrompt(resLimitSize, true));
    return this.tryRequest(baseMessages, model, resLimitSize, true);
  }

  public async chatWithText(prompt: string[], model: 'DeepSeek', resLimitSize = 2000): Promise<string> {
    const baseMessages = this.buildMessages(prompt, this.buildSystemPrompt(resLimitSize, false));
    return this.tryRequest(baseMessages, model, resLimitSize, false);
  }

  private buildSystemPrompt(limit: number, expectJson: boolean): string {
    const limitStr = limit > 0 ? `${limit}` : '2000';
    if (expectJson) {
      return `You are an assistant that must respond with a valid JSON string only. The response length must not exceed ${limitStr} characters. Do not wrap the output with explanations or code fences.`;
    }
    return `You are an assistant that must respond with plain text only. The response length must not exceed ${limitStr} characters. Do not include code fences or additional explanations.`;
  }

  private buildMessages(userPrompts: string[], systemPrompt: string): ChatMessage[] {
    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];
    userPrompts.forEach((item) => {
      const content = item.trim();
      if (content.length > 0) {
        messages.push({ role: 'user', content });
      }
    });
    return messages;
  }

  private async tryRequest(messages: ChatMessage[], model: 'DeepSeek', limit: number, expectJson: boolean): Promise<string> {
    let lastError: Error | undefined;
    let currentMessages = messages;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const responseText = await this.requestCompletion(currentMessages, model, limit);
        if (limit > 0 && responseText.length > limit) {
          lastError = new Error('AI response exceeded length limit.');
          currentMessages = [...messages, { role: 'user', content: `Your previous reply exceeded ${limit} characters. Return output within the limit only.` }];
          continue;
        }
        if (expectJson) {
          const normalized = this.normalizeJson(responseText);
          if (limit > 0 && normalized.length > limit) {
            lastError = new Error('Normalized JSON response exceeded length limit.');
            currentMessages = [...messages, { role: 'user', content: `Your previous reply exceeded ${limit} characters after normalization. Return compact JSON only.` }];
            continue;
          }
          return normalized;
        }
        return responseText;
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
        } else {
          lastError = new Error('Unexpected AI response error.');
        }
        currentMessages = [...messages, { role: 'user', content: 'Return the answer strictly following the previous instructions.' }];
      }
    }
    throw lastError ?? new Error('AI request failed.');
  }

  private async requestCompletion(messages: ChatMessage[], model: 'DeepSeek', limit: number): Promise<string> {
    this.assertConfiguration();
    const payload: ChatRequestPayload = { model, messages };
    if (limit > 0) {
      payload.max_output_tokens = limit;
    }
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}.`);
    }
    const data: AiResponse = await response.json();
    const content = this.extractContent(data);
    if (content.length === 0) {
      throw new Error('AI response content is empty.');
    }
    return content.trim();
  }

  private normalizeJson(raw: string): string {
    const trimmed = raw.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      throw new Error('Response is not a JSON string.');
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return JSON.stringify(parsed);
    } catch {
      throw new Error('Response is not valid JSON.');
    }
  }

  private extractContent(data: AiResponse): string {
    const [choice] = data.choices ?? [];
    if (!choice) {
      return '';
    }
    if (choice.message?.content) {
      return choice.message.content;
    }
    if (choice.content) {
      return choice.content;
    }
    return '';
  }

  private assertConfiguration(): void {
    if (!this.apiUrl) {
      throw new Error('AI apiUrl is not configured.');
    }
    if (!this.apiKey) {
      throw new Error('AI apiKey is not configured.');
    }
  }
}