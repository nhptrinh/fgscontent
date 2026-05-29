"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  ChevronRight,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";
import ModelSelector from "./model-selector";
import { DEFAULT_MODELS } from "@/lib/models";

interface GenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (content: string, title: string) => void;
}

type Step = "input" | "outline" | "generating" | "done";

interface OutlineSection {
  heading: string;
  heading_level: number;
  key_points: string[];
  entities_to_embed: string[];
  eeat_signals: string[];
  subsections: { heading: string; heading_level: number; key_points: string[] }[];
}

interface Outline {
  title: string;
  meta_description: string;
  slug: string;
  estimated_word_count: number;
  sections: OutlineSection[];
  faq: { question: string; answer: string }[];
}

export default function GenerationDialog({
  open,
  onClose,
  onGenerated,
}: GenerationDialogProps) {
  const [step, setStep] = useState<Step>("input");
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("Vietnamese");
  const [model, setModel] = useState<string>(DEFAULT_MODELS.content);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  if (!open) return null;

  const handleGenerateOutline = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setProgress("Đang phân tích topic & entities...");

    try {
      // First get entities
      const entityRes = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest",
          topic: keyword,
          language,
          model,
        }),
      });

      if (!entityRes.ok) throw new Error("Failed to get entities");
      const entityData = await entityRes.json();
      const entities = entityData.suggested_entities?.map(
        (e: { name: string }) => e.name
      ) || [];

      setProgress("Đang tạo outline bài viết...");

      // Generate outline
      const outlineRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "outline",
          keyword,
          entities,
          language,
          model,
        }),
      });

      if (!outlineRes.ok) throw new Error("Failed to generate outline");
      const outlineData = await outlineRes.json();
      setOutline(outlineData);
      setStep("outline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate outline");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const handleGenerateArticle = async () => {
    if (!outline) return;
    setStep("generating");
    setLoading(true);
    setError("");
    setProgress("Đang viết bài viết đầy đủ...");

    try {
      const entities = outline.sections.flatMap(
        (s) => s.entities_to_embed || []
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "article",
          outline,
          entities,
          language,
          model,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate article");
      const data = await res.json();

      setStep("done");
      onGenerated(data.content, outline.title);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate article"
      );
      setStep("outline");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const handleReset = () => {
    setStep("input");
    setKeyword("");
    setOutline(null);
    setError("");
    setProgress("");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl"
          style={{
            background: "rgba(12, 24, 41, 0.9)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Generate Article with AI
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--foreground-subtle)" }}
              >
                {step === "input" && "Enter your topic to start"}
                {step === "outline" && "Review outline before generating"}
                {step === "generating" && "Writing your article..."}
                {step === "done" && "Article generated successfully!"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--foreground-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 flex items-center gap-2">
          {(["input", "outline", "generating"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background:
                    step === s || (step === "done" && s === "generating")
                      ? "var(--primary)"
                      : ["outline", "generating", "done"].indexOf(step) > ["input", "outline", "generating"].indexOf(s)
                      ? "var(--success)"
                      : "rgba(255,255,255,0.06)",
                  color:
                    step === s || ["outline", "generating", "done"].indexOf(step) >= ["input", "outline", "generating"].indexOf(s)
                      ? "white"
                      : "var(--foreground-subtle)",
                }}
              >
                {["outline", "generating", "done"].indexOf(step) > ["input", "outline", "generating"].indexOf(s) ? (
                  <Check size={12} />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className="w-8 h-px"
                  style={{ background: "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{
                background: "var(--danger-light)",
                color: "var(--danger)",
              }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step: Input */}
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-medium block mb-1.5"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Topic / Keyword *
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., Entity SEO, Content Marketing Strategy..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--input-focus)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--input-border)";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && keyword.trim()) handleGenerateOutline();
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs font-medium block mb-1.5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="Japanese">日本語</option>
                    <option value="Korean">한국어</option>
                    <option value="Chinese">中文</option>
                    <option value="Thai">ภาษาไทย</option>
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs font-medium block mb-1.5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Model
                  </label>
                  <ModelSelector value={model} onChange={setModel} />
                </div>
              </div>
            </div>
          )}

          {/* Step: Outline Preview */}
          {step === "outline" && outline && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {outline.title}
                </h3>
                <p
                  className="text-xs mb-3"
                  style={{ color: "var(--foreground-subtle)" }}
                >
                  {outline.meta_description}
                </p>
                <div className="flex gap-3 text-[11px]" style={{ color: "var(--foreground-muted)" }}>
                  <span>~{outline.estimated_word_count} words</span>
                  <span>•</span>
                  <span>{outline.sections.length} sections</span>
                  <span>•</span>
                  <span>{outline.faq?.length || 0} FAQs</span>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2 max-h-60 overflow-auto">
                {outline.sections.map((section, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                      }}
                    >
                      H{section.heading_level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {section.heading}
                      </p>
                      {section.key_points && (
                        <div className="mt-1 space-y-0.5">
                          {section.key_points.slice(0, 3).map((point, j) => (
                            <p
                              key={j}
                              className="text-[11px] flex items-start gap-1"
                              style={{ color: "var(--foreground-subtle)" }}
                            >
                              <span className="mt-1">•</span>
                              <span>{point}</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-1.5 ml-3 space-y-1">
                          {section.subsections.map((sub, k) => (
                            <p
                              key={k}
                              className="text-[11px] flex items-center gap-1"
                              style={{ color: "var(--foreground-muted)" }}
                            >
                              <ChevronRight size={10} />
                              {sub.heading}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Generating */}
          {step === "generating" && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: "var(--primary-light)" }}>
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: "var(--primary)" }}
                />
              </div>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                {progress || "Generating your article..."}
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                This may take 30-60 seconds depending on article length
              </p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="py-8 text-center space-y-4">
              <div
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--success-light)" }}
              >
                <Check size={24} style={{ color: "var(--success)" }} />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Article generated successfully!
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                Content has been loaded into the editor. You can now edit and refine.
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && step === "input" && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
              <Loader2 size={16} className="animate-spin" />
              <span>{progress || "Processing..."}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 px-6 py-4 border-t flex items-center justify-between"
          style={{
            borderColor: "var(--border)",
            background: "rgba(12, 24, 41, 0.9)",
          }}
        >
          <button
            onClick={step === "done" ? onClose : handleReset}
            className="px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              color: "var(--foreground-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {step === "done" ? "Close" : "Reset"}
          </button>

          {step === "input" && (
            <button
              onClick={handleGenerateOutline}
              disabled={loading || !keyword.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: "var(--primary-gradient)",
                color: "white",
              }}
            >
              <Sparkles size={16} />
              Generate Outline
            </button>
          )}

          {step === "outline" && (
            <button
              onClick={handleGenerateArticle}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: "var(--primary-gradient)",
                color: "white",
              }}
            >
              <FileText size={16} />
              Generate Full Article
            </button>
          )}

          {step === "done" && (
            <button
              onClick={() => {
                handleReset();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
              }}
            >
              <Sparkles size={16} />
              Generate Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
