import { NextRequest, NextResponse } from "next/server";
import { extractEntities, suggestEntities } from "@/lib/entity-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, content, topic, existingEntities, language, model } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required (extract | suggest)" },
        { status: 400 }
      );
    }

    if (action === "extract") {
      if (!content || !topic) {
        return NextResponse.json(
          { error: "Content and topic are required for extraction" },
          { status: 400 }
        );
      }
      const result = await extractEntities(content, topic, model);
      return NextResponse.json(result);
    }

    if (action === "suggest") {
      if (!topic) {
        return NextResponse.json(
          { error: "Topic is required for suggestions" },
          { status: 400 }
        );
      }
      const result = await suggestEntities(
        topic,
        existingEntities || [],
        language || "Vietnamese",
        model
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid action. Use: extract | suggest" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API /entities]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process entities",
      },
      { status: 500 }
    );
  }
}
