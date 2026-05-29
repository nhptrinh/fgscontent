// ========================================
// Topic & Keyword Research (AI-powered)
// FoogleSEO — Semantic Content Platform
// ========================================

import { z } from "zod";
import { chat, chatJSON } from "./openrouter";
import type { UsageStats } from "./openrouter";
import { PROMPTS } from "./prompts";
import { DEFAULT_MODELS } from "./models";
import type { ChatMessage } from "./openrouter";

// --- Zod Schemas ---

const SearchIntentSchema = z.object({
  keyword: z.string(),
  intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
  difficulty: z.enum(["low", "medium", "high"]),
  priority: z.enum(["must_cover", "should_cover", "optional"]),
});

const KeywordClusterSchema = z.object({
  cluster_name: z.string(),
  keywords: z.array(z.string()),
  intent: z.string(),
});

const TopicResearchSchema = z.object({
  main_topic: z.string(),
  search_intents: z.array(SearchIntentSchema),
  keyword_clusters: z.array(KeywordClusterSchema),
  content_gaps: z.array(z.string()),
  recommended_angles: z.array(z.string()),
  estimated_articles_needed: z.number(),
});

export type TopicResearch = z.infer<typeof TopicResearchSchema>;

const TopicalNodeSchema: z.ZodType<TopicalNode> = z.lazy(() =>
  z.object({
    keyword: z.string(),
    title: z.string(),
    intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
    children: z.array(TopicalNodeSchema).default([]),
  })
);

interface TopicalNode {
  keyword: string;
  title: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  children: TopicalNode[];
}

const TopicalMapSchema = z.object({
  pillar: TopicalNodeSchema,
  total_articles: z.number(),
  coverage_strategy: z.string(),
});

export type TopicalMap = z.infer<typeof TopicalMapSchema>;

// --- Functions ---

/**
 * Research a topic — returns keyword clusters, search intents, content gaps
 */
export async function researchTopic(
  keyword: string,
  language: string = "Vietnamese",
  model?: string
): Promise<{ data: TopicResearch; usage: UsageStats }> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are an expert SEO researcher. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.RESEARCH_TOPIC(keyword, language),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.fast,
      temperature: 0.4,
      maxTokens: 4096,
    },
    TopicResearchSchema
  );
}

/**
 * Generate a Topical Map — hierarchical topic tree
 */
export async function generateTopicalMap(
  keyword: string,
  language: string = "Vietnamese",
  model?: string
): Promise<{ data: TopicalMap; usage: UsageStats }> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are an expert in content strategy and Topical Authority. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.TOPICAL_MAP(keyword, language),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.fast,
      temperature: 0.5,
      maxTokens: 4096,
    },
    TopicalMapSchema
  );
}
