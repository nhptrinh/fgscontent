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
      const { data: topicalMap, usage } = await generateTopicalMap(keyword, language, model);
      return NextResponse.json({ topicalMap, usage });
    }

    if (action === "research") {
      const { data: research, usage } = await researchTopic(keyword, language, model);
      return NextResponse.json({ research, usage });
    }

    // Full: both research + topical map
    const [researchResult, mapResult] = await Promise.all([
      researchTopic(keyword, language, model),
      generateTopicalMap(keyword, language, model),
    ]);

    const totalUsage = {
      promptTokens: researchResult.usage.promptTokens + mapResult.usage.promptTokens,
      completionTokens: researchResult.usage.completionTokens + mapResult.usage.completionTokens,
      totalTokens: researchResult.usage.totalTokens + mapResult.usage.totalTokens,
      costUSD: researchResult.usage.costUSD + mapResult.usage.costUSD,
      model: researchResult.usage.model,
    };

    return NextResponse.json({
      research: researchResult.data,
      topicalMap: mapResult.data,
      usage: totalUsage,
    });
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
