"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
  Quote,
  Undo2,
  Redo2,
  Sparkles,
  Save,
  Send,
  Loader2,
  RefreshCw,
  Check,
} from "lucide-react";
import ModelSelector from "@/components/ai/model-selector";
import GenerationDialog from "@/components/ai/generation-dialog";
import { DEFAULT_MODELS } from "@/lib/models";
import { saveDraft, getDraft, type Draft } from "@/lib/drafts";

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: string;
  shortcut?: string;
}

interface EntityItem {
  name: string;
  type: string;
  priority: string;
  is_embedded: boolean;
}

interface ReviewData {
  content_score: number;
  entity_coverage: number;
  eeat_scores: {
    experience: number;
    expertise: number;
    authoritativeness: number;
    trustworthiness: number;
    overall: number;
  };
  suggestions: {
    category: string;
    message: string;
    severity: string;
  }[];
  missing_entities: string[];
  strengths: string[];
}

const toolbarGroups: ToolbarButton[][] = [
  [
    { icon: Undo2, label: "Undo", action: "undo", shortcut: "Ctrl+Z" },
    { icon: Redo2, label: "Redo", action: "redo", shortcut: "Ctrl+Y" },
  ],
  [
    { icon: Bold, label: "Bold", action: "bold", shortcut: "Ctrl+B" },
    { icon: Italic, label: "Italic", action: "italic", shortcut: "Ctrl+I" },
    { icon: Code, label: "Code", action: "code" },
  ],
  [
    { icon: Heading1, label: "Heading 1", action: "h1" },
    { icon: Heading2, label: "Heading 2", action: "h2" },
    { icon: Heading3, label: "Heading 3", action: "h3" },
  ],
  [
    { icon: List, label: "Bullet List", action: "bulletList" },
    { icon: ListOrdered, label: "Numbered List", action: "orderedList" },
    { icon: Quote, label: "Quote", action: "blockquote" },
  ],
  [
    { icon: Link2, label: "Link", action: "link" },
    { icon: Image, label: "Image", action: "image" },
  ],
];

const eeatBarColors = [
  "var(--primary)",    // Experience
  "var(--success)",    // Expertise
  "var(--warning)",    // Authority
  "var(--secondary)",  // Trust
];

export default function ContentEditor() {
  return (
    <Suspense>
      <ContentEditorInner />
    </Suspense>
  );
}

function ContentEditorInner() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [model, setModel] = useState<string>(DEFAULT_MODELS.content);
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [language, setLanguage] = useState("Vietnamese");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Analysis state
  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Load draft from URL params
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const draft = getDraft(id);
      if (draft) {
        setDraftId(draft.id);
        setTitle(draft.title);
        setContent(draft.content);
        setModel(draft.model || DEFAULT_MODELS.content);
        setLanguage(draft.language || "Vietnamese");
      }
    }
  }, [searchParams]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!content && !title) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSaveDraft(true);
    }, 30000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, title]);

  // Save draft handler
  const handleSaveDraft = useCallback(
    (isAutoSave = false) => {
      if (!title && !content) return;
      setSaveStatus("saving");

      const saved = saveDraft({
        id: draftId || undefined,
        title: title || "Untitled Draft",
        content,
        model,
        language,
        contentScore: review?.content_score ?? null,
        eeatScore: review?.eeat_scores?.overall ?? null,
      });

      if (!draftId) setDraftId(saved.id);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), isAutoSave ? 2000 : 3000);
    },
    [draftId, title, content, model, language, review]
  );

  const handleToolbarAction = useCallback((action: string) => {
    console.log("Toolbar action:", action);
  }, []);

  const handleGenerated = useCallback(
    (generatedContent: string, generatedTitle: string) => {
      setContent(generatedContent);
      setTitle(generatedTitle);
      setShowGenerationDialog(false);
    },
    []
  );

  // Analyze entities when content changes (debounced)
  useEffect(() => {
    if (!content || content.length < 100) return;

    const timeout = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const res = await fetch("/api/entities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "extract",
            content,
            topic: title || "SEO",
            model,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setEntities(
            data.entities?.map((e: EntityItem) => ({
              ...e,
              is_embedded: content.toLowerCase().includes(e.name.toLowerCase()),
            })) || []
          );
        }
      } catch {
        // Silent fail for entity analysis
      } finally {
        setAnalyzing(false);
      }
    }, 3000); // 3s debounce

    return () => clearTimeout(timeout);
  }, [content, title, model]);

  // AI Review
  const handleReview = async () => {
    if (!content || content.length < 100) return;
    setReviewLoading(true);
    try {
      const entityNames = entities.map((e) => e.name);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          content,
          topic: title || "SEO",
          entities: entityNames,
          model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReview(data);
      }
    } catch {
      // Silent fail
    } finally {
      setReviewLoading(false);
    }
  };

  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Title Input */}
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent outline-none placeholder:text-gray-600"
            style={{ color: "var(--foreground)" }}
            placeholder="Article title..."
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
              {wordCount} words
            </span>
            {analyzing && (
              <span className="text-xs flex items-center gap-1" style={{ color: "var(--primary)" }}>
                <Loader2 size={10} className="animate-spin" />
                Analyzing entities...
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto"
          style={{
            borderColor: "var(--border)",
            background: "var(--background-secondary)",
          }}
        >
          {toolbarGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-0.5">
              {group.map((button) => (
                <button
                  key={button.action}
                  onClick={() => handleToolbarAction(button.action)}
                  className="p-2 rounded-lg transition-all duration-150"
                  style={{ color: "var(--foreground-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "var(--foreground)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--foreground-muted)";
                  }}
                  title={button.shortcut ? `${button.label} (${button.shortcut})` : button.label}
                >
                  <button.icon size={16} />
                </button>
              ))}
              {groupIndex < toolbarGroups.length - 1 && (
                <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
              )}
            </div>
          ))}

          {/* AI Actions */}
          <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />

          <button
            onClick={() => setShowGenerationDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: "var(--primary-light)",
              color: "var(--primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(43, 124, 197, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--primary-light)";
            }}
          >
            <Sparkles size={14} />
            Generate with AI
          </button>

          {/* Model selector */}
          <ModelSelector value={model} onChange={setModel} className="w-44" />

          {/* Save & Submit */}
          <div className="ml-auto flex items-center gap-2">
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-[11px] animate-fade-in" style={{ color: "var(--success)" }}>
                <Check size={12} />
                Saved
              </span>
            )}
            <button
              onClick={() => handleSaveDraft(false)}
              disabled={saveStatus === "saving" || (!title && !content)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                background: saveStatus === "saved" ? "var(--success-light)" : "rgba(255, 255, 255, 0.06)",
                color: saveStatus === "saved" ? "var(--success)" : "var(--foreground-muted)",
                border: `1px solid ${saveStatus === "saved" ? "rgba(34, 197, 94, 0.2)" : "var(--border)"}`,
              }}
            >
              {saveStatus === "saving" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check size={14} />
              ) : (
                <Save size={14} />
              )}
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Draft"}
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: "var(--primary-gradient)",
                color: "white",
              }}
            >
              <Send size={14} />
              Submit
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor */}
          <div className="flex-1 overflow-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-8 bg-transparent outline-none resize-none text-sm leading-relaxed font-mono"
              style={{
                color: "var(--foreground)",
                caretColor: "var(--primary)",
              }}
              placeholder="Start writing or use 'Generate with AI' to create content..."
              spellCheck={false}
            />
          </div>

          {/* Right Analysis Panel */}
          <aside
            className="w-[320px] border-l overflow-auto hidden lg:block"
            style={{
              borderColor: "var(--border)",
              background: "var(--background-secondary)",
            }}
          >
            {/* AI Review Button */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={handleReview}
                disabled={reviewLoading || !content || content.length < 100}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: "var(--primary-gradient)",
                  color: "white",
                }}
              >
                {reviewLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {reviewLoading ? "Analyzing..." : "AI Review"}
              </button>
            </div>

            {/* Content Score */}
            <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                Content Score
              </h3>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{
                    background: review
                      ? review.content_score >= 80
                        ? "var(--success-light)"
                        : review.content_score >= 60
                        ? "var(--warning-light)"
                        : "var(--danger-light)"
                      : "rgba(255,255,255,0.04)",
                    color: review
                      ? review.content_score >= 80
                        ? "var(--success)"
                        : review.content_score >= 60
                        ? "var(--warning)"
                        : "var(--danger)"
                      : "var(--foreground-subtle)",
                    border: review
                      ? `2px solid ${review.content_score >= 80 ? "var(--success)" : review.content_score >= 60 ? "var(--warning)" : "var(--danger)"}`
                      : "2px solid var(--border)",
                  }}
                >
                  {review ? review.content_score : "—"}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--foreground-muted)" }}>Entity Coverage</span>
                    <span style={{ color: review ? "var(--primary)" : "var(--foreground-subtle)" }}>
                      {review ? `${review.entity_coverage}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--foreground-muted)" }}>Word Count</span>
                    <span style={{ color: "var(--foreground-muted)" }}>{wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--foreground-muted)" }}>Entities Found</span>
                    <span style={{ color: "var(--foreground-muted)" }}>{entities.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* E-E-A-T Score */}
            <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                E-E-A-T Score
              </h3>
              <div className="space-y-3">
                {([
                  { label: "Experience", key: "experience" },
                  { label: "Expertise", key: "expertise" },
                  { label: "Authority", key: "authoritativeness" },
                  { label: "Trust", key: "trustworthiness" },
                ] as const).map((item, idx) => {
                  const score = review?.eeat_scores?.[item.key] ?? 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: "var(--foreground-muted)" }}>{item.label}</span>
                        <span className="font-bold" style={{ color: review ? eeatBarColors[idx] : "var(--foreground-subtle)" }}>
                          {review ? `${score}/10` : "—"}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255, 255, 255, 0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: review ? `${score * 10}%` : "0%",
                            background: eeatBarColors[idx],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Entity Checklist (Live) */}
            <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                Entity Checklist
                {analyzing && <Loader2 size={12} className="animate-spin" style={{ color: "var(--primary)" }} />}
              </h3>
              {entities.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                  {content.length < 100
                    ? "Write or generate content to see entities"
                    : "Analyzing..."}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-auto">
                  {entities.map((entity) => (
                    <div
                      key={entity.name}
                      className="flex items-center gap-2 py-1"
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: entity.is_embedded ? "var(--primary)" : "transparent",
                          border: entity.is_embedded ? "none" : "1.5px solid var(--border-hover)",
                        }}
                      >
                        {entity.is_embedded && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-xs flex-1"
                        style={{
                          color: entity.is_embedded ? "var(--foreground)" : "var(--foreground-muted)",
                        }}
                      >
                        {entity.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background:
                            entity.priority === "must_have"
                              ? "var(--danger-light)"
                              : entity.priority === "should_have"
                              ? "var(--warning-light)"
                              : "rgba(255,255,255,0.04)",
                          color:
                            entity.priority === "must_have"
                              ? "var(--danger)"
                              : entity.priority === "should_have"
                              ? "var(--warning)"
                              : "var(--foreground-subtle)",
                        }}
                      >
                        {entity.priority === "must_have" ? "Must" : entity.priority === "should_have" ? "Should" : "Nice"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            <div className="p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                E-E-A-T Suggestions
              </h3>
              {!review ? (
                <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                  Click &quot;AI Review&quot; to get suggestions
                </p>
              ) : (
                <div className="space-y-2">
                  {review.suggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                      style={{
                        background:
                          suggestion.severity === "required"
                            ? "var(--warning-light)"
                            : suggestion.severity === "recommended"
                            ? "var(--primary-light)"
                            : "var(--success-light)",
                        color:
                          suggestion.severity === "required"
                            ? "var(--warning)"
                            : suggestion.severity === "recommended"
                            ? "var(--primary-hover)"
                            : "var(--success)",
                      }}
                    >
                      <span className="flex-shrink-0">
                        {suggestion.severity === "required" ? "⚠️" : suggestion.severity === "recommended" ? "💡" : "✅"}
                      </span>
                      <span className="leading-relaxed">{suggestion.message}</span>
                    </div>
                  ))}
                  {review.strengths.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
                        Strengths
                      </p>
                      {review.strengths.map((s, i) => (
                        <p key={i} className="text-[11px] flex items-start gap-1 py-0.5" style={{ color: "var(--success)" }}>
                          <span>✓</span>
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Generation Dialog */}
      <GenerationDialog
        open={showGenerationDialog}
        onClose={() => setShowGenerationDialog(false)}
        onGenerated={handleGenerated}
      />
    </>
  );
}
