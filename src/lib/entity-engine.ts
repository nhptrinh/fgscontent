// ========================================
// Entity Engine (LLM-powered)
// FoogleSEO — Semantic Content Platform
// ========================================

import { z } from "zod";
import { chatJSON } from "./openrouter";
import { PROMPTS } from "./prompts";
import { DEFAULT_MODELS } from "./models";
import type { ChatMessage } from "./openrouter";

// --- Zod Schemas ---

const EntityRelationSchema = z.object({
  target: z.string(),
  relation: z.enum(["is_part_of", "related_to", "is_type_of", "authored_by", "used_by"]),
});

const ExtractedEntitySchema = z.object({
  name: z.string(),
  type: z.enum(["person", "organization", "place", "concept", "product", "event", "other"]),
  priority: z.enum(["must_have", "should_have", "nice_to_have"]),
  description: z.string(),
  is_embedded: z.boolean(),
  relationships: z.array(EntityRelationSchema).default([]),
});

const EntityExtractionResultSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
  coverage_score: z.number().min(0).max(100),
  missing_entities: z.array(z.string()).default([]),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntitySchema>;
export type EntityExtractionResult = z.infer<typeof EntityExtractionResultSchema>;

const SuggestedEntitySchema = z.object({
  name: z.string(),
  type: z.enum(["person", "organization", "place", "concept", "product", "event", "other"]),
  priority: z.enum(["must_have", "should_have", "nice_to_have"]),
  reason: z.string(),
  suggested_context: z.string(),
});

const EntitySuggestionResultSchema = z.object({
  suggested_entities: z.array(SuggestedEntitySchema),
});

export type SuggestedEntity = z.infer<typeof SuggestedEntitySchema>;
export type EntitySuggestionResult = z.infer<typeof EntitySuggestionResultSchema>;

// --- Functions ---

/**
 * Extract entities from content
 */
export async function extractEntities(
  content: string,
  topic: string,
  model?: string
): Promise<EntityExtractionResult> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a Semantic SEO expert. Analyze content for entities. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.EXTRACT_ENTITIES(content, topic),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.fast,
      temperature: 0.3,
      maxTokens: 4096,
    },
    EntityExtractionResultSchema
  );
}

/**
 * Suggest additional entities for a topic
 */
export async function suggestEntities(
  topic: string,
  existingEntities: string[],
  language: string = "Vietnamese",
  model?: string
): Promise<EntitySuggestionResult> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a Semantic SEO expert. Suggest entities for comprehensive coverage. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.SUGGEST_ENTITIES(topic, existingEntities, language),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.fast,
      temperature: 0.4,
      maxTokens: 2048,
    },
    EntitySuggestionResultSchema
  );
}
