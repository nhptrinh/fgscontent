// ========================================
// Content Generation Pipeline
// FoogleSEO — Semantic Content Platform
// ========================================

import { z } from "zod";
import { chat, chatJSON, chatStream } from "./openrouter";
import { PROMPTS } from "./prompts";
import { DEFAULT_MODELS } from "./models";
import type { ChatMessage } from "./openrouter";

// --- Zod Schemas ---

const SubsectionSchema = z.object({
  heading: z.string(),
  heading_level: z.number(),
  key_points: z.array(z.string()),
  entities_to_embed: z.array(z.string()).default([]),
});

const OutlineSectionSchema = z.object({
  heading: z.string(),
  heading_level: z.number(),
  key_points: z.array(z.string()),
  entities_to_embed: z.array(z.string()).default([]),
  eeat_signals: z.array(z.string()).default([]),
  subsections: z.array(SubsectionSchema).default([]),
});

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const OutlineSchema = z.object({
  title: z.string(),
  meta_description: z.string(),
  slug: z.string(),
  estimated_word_count: z.number(),
  sections: z.array(OutlineSectionSchema),
  faq: z.array(FaqItemSchema).default([]),
});

export type ArticleOutline = z.infer<typeof OutlineSchema>;
export type OutlineSection = z.infer<typeof OutlineSectionSchema>;

const MetaSchema = z.object({
  title_tag: z.string(),
  meta_description: z.string(),
  slug: z.string(),
  faq_schema: z.array(FaqItemSchema).default([]),
});

export type ArticleMeta = z.infer<typeof MetaSchema>;

const EeatScoresSchema = z.object({
  experience: z.number().min(0).max(10),
  expertise: z.number().min(0).max(10),
  authoritativeness: z.number().min(0).max(10),
  trustworthiness: z.number().min(0).max(10),
  overall: z.number().min(0).max(10),
});

const ReviewSuggestionSchema = z.object({
  category: z.enum(["experience", "expertise", "authoritativeness", "trustworthiness"]),
  message: z.string(),
  severity: z.enum(["required", "recommended", "optional"]),
});

const ContentReviewSchema = z.object({
  content_score: z.number().min(0).max(100),
  entity_coverage: z.number().min(0).max(100),
  eeat_scores: EeatScoresSchema,
  suggestions: z.array(ReviewSuggestionSchema),
  missing_entities: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  word_count_assessment: z.enum(["too_short", "adequate", "comprehensive"]),
});

export type ContentReview = z.infer<typeof ContentReviewSchema>;

// --- Pipeline Functions ---

/**
 * Step 1: Generate article outline
 */
export async function generateOutline(
  keyword: string,
  entities: string[],
  language: string = "Vietnamese",
  eeatNotes: string = "",
  model?: string
): Promise<ArticleOutline> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an expert content strategist. Create detailed, SEO-optimized outlines. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.GENERATE_OUTLINE(keyword, entities, language, eeatNotes),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.content,
      temperature: 0.5,
      maxTokens: 4096,
    },
    OutlineSchema
  );
}

/**
 * Step 2: Generate a single section (non-streaming)
 */
export async function generateSection(
  sectionOutline: OutlineSection,
  topic: string,
  entities: string[],
  language: string = "Vietnamese",
  previousContext: string = "",
  model?: string
): Promise<string> {
  const sectionDesc = JSON.stringify({
    heading: sectionOutline.heading,
    key_points: sectionOutline.key_points,
    subsections: sectionOutline.subsections?.map((s) => ({
      heading: s.heading,
      key_points: s.key_points,
    })),
  });

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an expert content writer. Write engaging, well-researched content in Markdown format.",
    },
    {
      role: "user",
      content: PROMPTS.GENERATE_SECTION(
        sectionDesc,
        topic,
        entities,
        language,
        previousContext
      ),
    },
  ];

  const response = await chat(messages, {
    model: model || DEFAULT_MODELS.content,
    temperature: 0.7,
    maxTokens: 2048,
  });

  return response.content;
}

/**
 * Step 2b: Generate a section with streaming
 */
export function generateSectionStream(
  sectionOutline: OutlineSection,
  topic: string,
  entities: string[],
  language: string = "Vietnamese",
  previousContext: string = "",
  model?: string
): ReadableStream<Uint8Array> {
  const sectionDesc = JSON.stringify({
    heading: sectionOutline.heading,
    key_points: sectionOutline.key_points,
    subsections: sectionOutline.subsections?.map((s) => ({
      heading: s.heading,
      key_points: s.key_points,
    })),
  });

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an expert content writer. Write engaging, well-researched content in Markdown format.",
    },
    {
      role: "user",
      content: PROMPTS.GENERATE_SECTION(
        sectionDesc,
        topic,
        entities,
        language,
        previousContext
      ),
    },
  ];

  return chatStream(messages, {
    model: model || DEFAULT_MODELS.content,
    temperature: 0.7,
    maxTokens: 2048,
  });
}

/**
 * Step 3: Generate full article from outline (non-streaming)
 */
export async function generateFullArticle(
  outline: ArticleOutline,
  entities: string[],
  language: string = "Vietnamese",
  model?: string
): Promise<string> {
  let fullContent = `# ${outline.title}\n\n`;
  let previousContext = "";

  for (const section of outline.sections) {
    // Add heading
    const headingPrefix = "#".repeat(section.heading_level);
    fullContent += `${headingPrefix} ${section.heading}\n\n`;

    // Generate section content
    const sectionContent = await generateSection(
      section,
      outline.title,
      entities,
      language,
      previousContext,
      model
    );

    fullContent += sectionContent + "\n\n";
    previousContext = sectionContent;

    // Generate subsections
    for (const sub of section.subsections || []) {
      const subPrefix = "#".repeat(sub.heading_level);
      fullContent += `${subPrefix} ${sub.heading}\n\n`;

      const subContent = await generateSection(
        { ...sub, eeat_signals: [], subsections: [] } as OutlineSection,
        outline.title,
        sub.entities_to_embed || [],
        language,
        previousContext,
        model
      );

      fullContent += subContent + "\n\n";
      previousContext = subContent;
    }
  }

  // Add FAQ section if available
  if (outline.faq && outline.faq.length > 0) {
    fullContent += "## Câu hỏi thường gặp (FAQ)\n\n";
    for (const faq of outline.faq) {
      fullContent += `### ${faq.question}\n\n${faq.answer}\n\n`;
    }
  }

  return fullContent;
}

/**
 * Step 4: Generate SEO meta tags
 */
export async function generateMeta(
  articleContent: string,
  language: string = "Vietnamese",
  model?: string
): Promise<ArticleMeta> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an SEO specialist. Generate optimized meta tags. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.GENERATE_META(articleContent, language),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.fast,
      temperature: 0.3,
      maxTokens: 1024,
    },
    MetaSchema
  );
}

/**
 * Step 5: Review content for quality, entities, and E-E-A-T
 */
export async function reviewContent(
  content: string,
  entities: string[],
  topic: string,
  model?: string
): Promise<ContentReview> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an E-E-A-T compliance reviewer. Provide thorough, actionable reviews. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: PROMPTS.REVIEW_CONTENT(content, entities, topic),
    },
  ];

  return chatJSON(
    messages,
    {
      model: model || DEFAULT_MODELS.fast,
      temperature: 0.3,
      maxTokens: 2048,
    },
    ContentReviewSchema
  );
}
