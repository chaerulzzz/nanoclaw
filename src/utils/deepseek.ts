/**
 * DeepSeek API utility for NanoClaw
 * Used as a fallback when Claude returns 429 (Rate Limit) or 503 errors.
 */

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResult {
  content: string;
  reasoning?: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      reasoning_content?: string;
    };
  }>;
}

async function callDeepSeekApi(
  messages: DeepSeekMessage[],
  model: string,
  apiKey: string,
): Promise<DeepSeekResult> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as DeepSeekResponse;
  const message = data.choices[0]?.message;
  if (!message) {
    throw new Error('DeepSeek returned no choices');
  }

  return {
    content: message.content,
    reasoning: message.reasoning_content,
  };
}

export async function callDeepSeekChat(
  messages: DeepSeekMessage[],
  apiKey: string,
): Promise<DeepSeekResult> {
  return callDeepSeekApi(messages, 'deepseek-chat', apiKey);
}

export async function callDeepSeekReasoning(
  messages: DeepSeekMessage[],
  apiKey: string,
): Promise<DeepSeekResult> {
  return callDeepSeekApi(messages, 'deepseek-reasoner', apiKey);
}

export function isRateLimitError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('503') ||
    lower.includes('service unavailable') ||
    lower.includes('overloaded')
  );
}
