import { NextRequest, NextResponse } from "next/server";
import { researchTopic, generateTopicalMap } from "@/lib/research";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, language = "Vietnamese", model, action = "full" } = body;

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    if (action === "topical_map") {
      const topicalMap = await generateTopicalMap(keyword, language, model);
      return NextResponse.json({ topicalMap });
    }

    if (action === "research") {
      const research = await researchTopic(keyword, language, model);
      return NextResponse.json({ research });
    }

    // Full: both research + topical map
    const [research, topicalMap] = await Promise.all([
      researchTopic(keyword, language, model),
      generateTopicalMap(keyword, language, model),
    ]);

    return NextResponse.json({ research, topicalMap });
  } catch (error) {
    console.error("[API /research]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform research",
      },
      { status: 500 }
    );
  }
}
