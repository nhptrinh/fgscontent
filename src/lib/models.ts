// ========================================
// LLM Model Configuration
// FoogleSEO — Semantic Content Platform
// ========================================

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: "fast" | "quality" | "premium";
  description: string;
  maxTokens: number;
  costPer1kInput: number; // USD
  costPer1kOutput: number; // USD
  supportsStreaming: boolean;
  supportsJSON: boolean;
}

// Recommended models grouped by tier
export const MODELS: ModelConfig[] = [
  // --- Fast tier (entity extraction, outlines, quick tasks) ---
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    tier: "fast",
    description: "Rất nhanh, chi phí thấp, phù hợp cho phân tích & outline",
    maxTokens: 65536,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    supportsStreaming: true,
    supportsJSON: true,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    provider: "DeepSeek",
    tier: "fast",
    description: "Chi phí cực thấp, tốt cho tác vụ đơn giản",
    maxTokens: 32768,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    supportsStreaming: true,
    supportsJSON: true,
  },

  // --- Quality tier (content writing, rewriting) ---
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    tier: "quality",
    description: "Viết content tự nhiên, sáng tạo, đa ngôn ngữ",
    maxTokens: 16384,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    supportsStreaming: true,
    supportsJSON: true,
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    tier: "quality",
    description: "Phân tích sâu, viết chi tiết, logic tốt",
    maxTokens: 16384,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    supportsStreaming: true,
    supportsJSON: true,
  },

  // --- Premium tier (complex analysis, highest quality) ---
  {
    id: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    tier: "premium",
    description: "Chất lượng cao nhất, phù hợp nội dung chuyên sâu",
    maxTokens: 16384,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    supportsStreaming: true,
    supportsJSON: true,
  },
  {
    id: "openai/o3",
    name: "OpenAI o3",
    provider: "OpenAI",
    tier: "premium",
    description: "Suy luận mạnh, phân tích phức tạp",
    maxTokens: 100000,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.04,
    supportsStreaming: true,
    supportsJSON: true,
  },
];

// Default model for each use case
export const DEFAULT_MODELS = {
  // Content generation (default for writing articles)
  content: "google/gemini-2.5-flash",
  // Fast tasks (entity extraction, keyword analysis, outlines)
  fast: "google/gemini-2.5-flash",
  // Quality tasks (rewriting, review)
  quality: "openai/gpt-4o",
} as const;

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === modelId);
}

export function getModelsByTier(tier: ModelConfig["tier"]): ModelConfig[] {
  return MODELS.filter((m) => m.tier === tier);
}

export function getDefaultModel(
  useCase: keyof typeof DEFAULT_MODELS = "content"
): ModelConfig {
  const modelId = DEFAULT_MODELS[useCase];
  return MODELS.find((m) => m.id === modelId) || MODELS[0];
}
