// ========================================
// LLM Prompt Templates
// FoogleSEO — Semantic Content Platform
// ========================================

export const PROMPTS = {
  // --- Topic Research ---
  RESEARCH_TOPIC: (keyword: string, language: string) => `You are an expert SEO strategist specializing in Semantic SEO, Entity SEO, and Topical Authority.

Analyze the topic/keyword: "${keyword}"
Language for output: ${language}

Generate a comprehensive topic research report with:

1. **main_topic**: The primary topic (string)
2. **search_intents**: Array of search intents for this topic, each with:
   - keyword (string)
   - intent: "informational" | "commercial" | "transactional" | "navigational"
   - difficulty: "low" | "medium" | "high"
   - priority: "must_cover" | "should_cover" | "optional"
3. **keyword_clusters**: Array of keyword groups, each with:
   - cluster_name (string)
   - keywords: string[]
   - intent: string
4. **content_gaps**: Array of strings - topics competitors likely miss
5. **recommended_angles**: Array of strings - unique content angles
6. **estimated_articles_needed**: number - to fully cover topical authority

Respond in valid JSON format.`,

  // --- Topical Map ---
  TOPICAL_MAP: (keyword: string, language: string) => `You are an expert in Topical Authority and content strategy.

Generate a comprehensive Topical Map for: "${keyword}"
Language: ${language}

Create a hierarchical tree structure where:
- The root is the main pillar topic
- Level 2 nodes are major subtopics (pillar pages)  
- Level 3 nodes are supporting articles

Output format:
{
  "pillar": {
    "keyword": "main keyword",
    "title": "Pillar page title",
    "intent": "informational",
    "children": [
      {
        "keyword": "subtopic keyword",
        "title": "Subtopic title",
        "intent": "informational" | "commercial" | "transactional",
        "children": [
          {
            "keyword": "supporting keyword",
            "title": "Article title",
            "intent": "informational" | "commercial" | "transactional",
            "children": []
          }
        ]
      }
    ]
  },
  "total_articles": number,
  "coverage_strategy": "brief description of the content strategy"
}

Generate 3-5 level-2 subtopics, each with 2-4 supporting articles. Respond in valid JSON.`,

  // --- Entity Extraction ---
  EXTRACT_ENTITIES: (content: string, topic: string) => `You are a Semantic SEO expert specializing in Entity Recognition and Knowledge Graph optimization.

Analyze the following content about "${topic}" and extract all semantic entities.

CONTENT:
"""
${content.slice(0, 8000)}
"""

For each entity found, provide:
{
  "entities": [
    {
      "name": "Entity name",
      "type": "person" | "organization" | "place" | "concept" | "product" | "event" | "other",
      "priority": "must_have" | "should_have" | "nice_to_have",
      "description": "Brief description of this entity in context",
      "is_embedded": true/false (whether it's already mentioned in the content),
      "relationships": [
        { "target": "Other Entity Name", "relation": "is_part_of" | "related_to" | "is_type_of" | "authored_by" | "used_by" }
      ]
    }
  ],
  "coverage_score": 0-100 (how well entities are covered),
  "missing_entities": ["entity names that should be added but are missing"]
}

Be thorough — include both obvious and subtle entities that Google's Knowledge Graph would recognize. Respond in valid JSON.`,

  // --- Entity Suggestion ---
  SUGGEST_ENTITIES: (topic: string, existingEntities: string[], language: string) => `You are a Semantic SEO expert. Given this topic and existing entities, suggest additional entities needed for comprehensive topical coverage.

Topic: "${topic}"
Language: ${language}
Already covered entities: ${existingEntities.join(", ") || "None"}

Suggest entities that:
1. Google Knowledge Graph would associate with this topic
2. Would strengthen E-E-A-T signals
3. Are commonly covered by top-ranking content
4. Would help AI/LLMs better understand the content's context

Output:
{
  "suggested_entities": [
    {
      "name": "Entity name",
      "type": "person" | "organization" | "place" | "concept" | "product" | "event" | "other",
      "priority": "must_have" | "should_have" | "nice_to_have",
      "reason": "Why this entity should be included",
      "suggested_context": "How to naturally embed this entity in content"
    }
  ]
}

Respond in valid JSON.`,

  // --- Content Outline ---
  GENERATE_OUTLINE: (
    keyword: string,
    entities: string[],
    language: string,
    eeatNotes: string
  ) => `You are an expert content strategist creating SEO-optimized article outlines that maximize Entity Coverage and E-E-A-T signals.

Create a comprehensive article outline for: "${keyword}"
Language: ${language}
Key entities to embed: ${entities.join(", ")}
E-E-A-T requirements: ${eeatNotes || "Standard E-E-A-T compliance"}

Output format:
{
  "title": "SEO-optimized H1 title",
  "meta_description": "Compelling meta description (150-160 chars)",
  "slug": "url-friendly-slug",
  "estimated_word_count": number,
  "sections": [
    {
      "heading": "H2 heading",
      "heading_level": 2,
      "key_points": ["point 1", "point 2"],
      "entities_to_embed": ["Entity A", "Entity B"],
      "eeat_signals": ["What E-E-A-T element this section serves"],
      "subsections": [
        {
          "heading": "H3 heading",
          "heading_level": 3,
          "key_points": ["point 1"],
          "entities_to_embed": ["Entity C"]
        }
      ]
    }
  ],
  "faq": [
    { "question": "FAQ question", "answer": "Brief answer" }
  ]
}

Ensure:
- Natural entity placement (not keyword stuffing)
- Clear E-E-A-T signals (expert citations, data, experience)
- Logical flow from introduction to conclusion
- FAQ section for featured snippet opportunities

Respond in valid JSON.`,

  // --- Full Article Section ---
  GENERATE_SECTION: (
    sectionOutline: string,
    topic: string,
    entities: string[],
    language: string,
    previousContext: string
  ) => `You are an expert content writer specializing in SEO-optimized, E-E-A-T compliant content.

Write the following section of an article about "${topic}".
Language: ${language}

SECTION TO WRITE:
${sectionOutline}

Entities to naturally embed: ${entities.join(", ")}

${previousContext ? `PREVIOUS CONTENT CONTEXT (for continuity):\n${previousContext.slice(-1500)}` : "This is the beginning of the article."}

WRITING GUIDELINES:
- Write in Markdown format
- Embed entities naturally — never force or stuff
- Include E-E-A-T signals: cite experts, reference data, share practical experience
- Use clear, engaging prose appropriate for the target audience
- Include relevant examples, statistics, or case studies where appropriate
- Maintain continuity with previous sections
- DO NOT include the section heading (it will be added separately)
- Write substantive content (200-500 words per section)

Write the section content now:`,

  // --- SEO Meta Generation ---
  GENERATE_META: (
    articleContent: string,
    language: string
  ) => `You are an SEO specialist. Generate optimized meta tags for this article.

ARTICLE (first 3000 chars):
"""
${articleContent.slice(0, 3000)}
"""

Language: ${language}

Output format:
{
  "title_tag": "SEO title (50-60 chars, include primary keyword)",
  "meta_description": "Compelling description (150-160 chars)",
  "slug": "url-friendly-slug",
  "faq_schema": [
    { "question": "Question", "answer": "Answer (2-3 sentences)" }
  ]
}

Respond in valid JSON.`,

  // --- Content Review ---
  REVIEW_CONTENT: (
    content: string,
    entities: string[],
    topic: string
  ) => `You are an E-E-A-T compliance reviewer and Semantic SEO expert.

Review this article about "${topic}" for quality, entity coverage, and E-E-A-T compliance.

CONTENT:
"""
${content.slice(0, 10000)}
"""

Expected entities: ${entities.join(", ")}

Provide a comprehensive review:
{
  "content_score": 0-100,
  "entity_coverage": 0-100,
  "eeat_scores": {
    "experience": 0-10,
    "expertise": 0-10,
    "authoritativeness": 0-10,
    "trustworthiness": 0-10,
    "overall": 0-10
  },
  "suggestions": [
    {
      "category": "experience" | "expertise" | "authoritativeness" | "trustworthiness",
      "message": "Specific actionable suggestion",
      "severity": "required" | "recommended" | "optional"
    }
  ],
  "missing_entities": ["entities not yet covered"],
  "strengths": ["what the content does well"],
  "word_count_assessment": "too_short" | "adequate" | "comprehensive"
}

Be constructive and specific. Respond in valid JSON.`,
} as const;
