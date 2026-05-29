// ========================================
// OpenRouter LLM Client
// FoogleSEO — Semantic Content Platform
// ========================================

import { z } from "zod";

// --- Types ---

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  jsonMode?: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

// --- OpenRouter Client ---

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Please add it in Settings."
    );
  }
  return key;
}

function buildHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://foogleseo.com",
    "X-Title": "FoogleSEO Content Platform",
  };
}

/**
 * Non-streaming chat completion
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<ChatResponse> {
  const body: Record<string, unknown> = {
    model: options.model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    top_p: options.topP ?? 1,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(
          `OpenRouter API error (${res.status}): ${errorBody}`
        );
      }

      const data = await res.json();
      const choice = data.choices?.[0];

      return {
        content: choice?.message?.content || "",
        model: data.model || options.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        finishReason: choice?.finish_reason || "stop",
      };
    } catch (err) {
      lastError = err as Error;
      // Don't retry on auth errors
      if (
        lastError.message.includes("401") ||
        lastError.message.includes("403")
      ) {
        throw lastError;
      }
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise((r) =>
          setTimeout(r, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("OpenRouter request failed after retries");
}

/**
 * Streaming chat completion — returns a ReadableStream for the API route
 */
export function chatStream(
  messages: ChatMessage[],
  options: ChatOptions
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const body: Record<string, unknown> = {
          model: options.model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          top_p: options.topP ?? 1,
          stream: true,
        };

        if (options.jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const res = await fetch(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            method: "POST",
            headers: buildHeaders(),
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const errorBody = await res.text();
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: `API error (${res.status}): ${errorBody}` })}\n\n`
            )
          );
          controller.close();
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(
                encoder.encode("data: [DONE]\n\n")
              );
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content =
                parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ content })}\n\n`
                  )
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: errorMsg })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Chat with structured JSON output, validated by Zod schema
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  options: ChatOptions,
  schema: z.ZodSchema<T>
): Promise<T> {
  // Add JSON instruction to system message
  const jsonMessages: ChatMessage[] = [
    ...messages,
    {
      role: "user",
      content:
        "IMPORTANT: Respond ONLY with valid JSON matching the requested schema. No markdown fences, no explanation text outside the JSON.",
    },
  ];

  const response = await chat(jsonMessages, {
    ...options,
    jsonMode: true,
    temperature: options.temperature ?? 0.3, // Lower temp for structured output
  });

  try {
    // Try to extract JSON from response (handle markdown fences)
    let jsonStr = response.content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);
    return schema.parse(parsed);
  } catch (err) {
    throw new Error(
      `Failed to parse LLM JSON response: ${err instanceof Error ? err.message : "Unknown error"}\n\nRaw response:\n${response.content.slice(0, 500)}`
    );
  }
}

/**
 * Test API connection — returns model info or throws
 */
export async function testConnection(): Promise<{
  ok: boolean;
  models: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: buildHeaders(),
    });

    if (!res.ok) {
      return {
        ok: false,
        models: 0,
        error: `API returned ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      ok: true,
      models: data.data?.length || 0,
    };
  } catch (err) {
    return {
      ok: false,
      models: 0,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}
