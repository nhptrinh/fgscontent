import { NextRequest, NextResponse } from "next/server";
import {
  generateOutline,
  generateFullArticle,
  generateMeta,
  reviewContent,
  generateSectionStream,
} from "@/lib/content-generator";
import type { OutlineSection } from "@/lib/content-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, keyword, entities, language, model, content, topic, outline, eeatNotes, section, previousContext } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required (outline | article | section_stream | meta | review)" },
        { status: 400 }
      );
    }

    // --- Generate Outline ---
    if (action === "outline") {
      if (!keyword) {
        return NextResponse.json(
          { error: "Keyword is required" },
          { status: 400 }
        );
      }
      const { data: result, usage } = await generateOutline(
        keyword,
        entities || [],
        language || "Vietnamese",
        eeatNotes || "",
        model
      );
      return NextResponse.json({ ...result, usage });
    }

    // --- Generate Full Article (non-streaming) ---
    if (action === "article") {
      if (!outline) {
        return NextResponse.json(
          { error: "Outline is required" },
          { status: 400 }
        );
      }
      const result = await generateFullArticle(
        outline,
        entities || [],
        language || "Vietnamese",
        model
      );
      return NextResponse.json({
        content: result.content,
        usage: result.usage,
      });
    }

    // --- Stream a single section ---
    if (action === "section_stream") {
      if (!section || !topic) {
        return NextResponse.json(
          { error: "Section and topic are required" },
          { status: 400 }
        );
      }
      const stream = generateSectionStream(
        section as OutlineSection,
        topic,
        entities || [],
        language || "Vietnamese",
        previousContext || "",
        model
      );
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // --- Generate SEO Meta ---
    if (action === "meta") {
      if (!content) {
        return NextResponse.json(
          { error: "Content is required" },
          { status: 400 }
        );
      }
      const { data: result, usage } = await generateMeta(content, language || "Vietnamese", model);
      return NextResponse.json({ ...result, usage });
    }

    // --- Review Content ---
    if (action === "review") {
      if (!content || !topic) {
        return NextResponse.json(
          { error: "Content and topic are required" },
          { status: 400 }
        );
      }
      const { data: result, usage } = await reviewContent(
        content,
        entities || [],
        topic,
        model
      );
      return NextResponse.json({ ...result, usage });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API /generate]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}
