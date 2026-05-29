"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  ChevronRight,
  ChevronDown,
  Globe,
  Tag,
  TrendingUp,
  Map,
  Zap,
  FileText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import ModelSelector from "@/components/ai/model-selector";
import { DEFAULT_MODELS } from "@/lib/models";
import Link from "next/link";

interface TopicalNode {
  keyword: string;
  title: string;
  intent: string;
  children: TopicalNode[];
}

interface TopicalMap {
  pillar: TopicalNode;
  total_articles: number;
  coverage_strategy: string;
}

interface SearchIntent {
  keyword: string;
  intent: string;
  difficulty: string;
  priority: string;
}

interface KeywordCluster {
  cluster_name: string;
  keywords: string[];
  intent: string;
}

interface TopicResearch {
  main_topic: string;
  search_intents: SearchIntent[];
  keyword_clusters: KeywordCluster[];
  content_gaps: string[];
  recommended_angles: string[];
  estimated_articles_needed: number;
}

const intentColors: Record<string, string> = {
  informational: "var(--primary)",
  commercial: "var(--warning)",
  transactional: "var(--success)",
  navigational: "var(--secondary)",
};

const priorityColors: Record<string, string> = {
  must_cover: "var(--danger)",
  should_cover: "var(--warning)",
  optional: "var(--foreground-subtle)",
};

function TopicTreeNode({
  node,
  depth = 0,
}: {
  node: TopicalNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer group"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--sidebar-item-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={14} style={{ color: "var(--foreground-subtle)" }} />
          ) : (
            <ChevronRight size={14} style={{ color: "var(--foreground-subtle)" }} />
          )
        ) : (
          <FileText size={14} style={{ color: "var(--foreground-subtle)" }} />
        )}

        <span
          className="text-sm flex-1"
          style={{
            color: depth === 0 ? "var(--foreground)" : "var(--foreground-muted)",
            fontWeight: depth === 0 ? 600 : depth === 1 ? 500 : 400,
          }}
        >
          {node.title || node.keyword}
        </span>

        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: `${intentColors[node.intent] || "var(--foreground-subtle)"}20`,
            color: intentColors[node.intent] || "var(--foreground-subtle)",
          }}
        >
          {node.intent}
        </span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child, i) => (
            <TopicTreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("Vietnamese");
  const [model, setModel] = useState<string>(DEFAULT_MODELS.fast);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [research, setResearch] = useState<TopicResearch | null>(null);
  const [topicalMap, setTopicalMap] = useState<TopicalMap | null>(null);
  const [activeTab, setActiveTab] = useState<"keywords" | "topical_map" | "gaps">("keywords");

  const handleResearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, language, model, action: "full" }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Research failed");
      }

      const data = await res.json();
      setResearch(data.research);
      setTopicalMap(data.topicalMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Keyword & Topic Research
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
          AI-powered topic analysis, keyword clustering, and topical map generation.
        </p>
      </div>

      {/* Search Bar */}
      <div
        className="rounded-2xl p-5 space-y-4 animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          animationDelay: "100ms",
        }}
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--foreground-subtle)" }}
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter seed keyword or topic..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
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
                if (e.key === "Enter" && keyword.trim() && !loading) handleResearch();
              }}
            />
          </div>
          <button
            onClick={handleResearch}
            disabled={loading || !keyword.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: "var(--primary-gradient)",
              color: "white",
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Analyze
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs outline-none"
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
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
              Model:
            </label>
            <ModelSelector value={model} onChange={setModel} className="w-48" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2 p-4 rounded-xl text-sm animate-fade-in"
          style={{
            background: "var(--danger-light)",
            color: "var(--danger)",
          }}
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          className="rounded-2xl p-12 text-center animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          <Loader2
            size={32}
            className="mx-auto animate-spin mb-4"
            style={{ color: "var(--primary)" }}
          />
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Analyzing &quot;{keyword}&quot;...
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--foreground-subtle)" }}>
            Generating keyword clusters, topical map, and entity analysis
          </p>
        </div>
      )}

      {/* Results */}
      {research && !loading && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            <div className="stat-card-blue rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={18} style={{ color: "var(--secondary)" }} />
                <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                  Keywords Found
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {research.search_intents.length}
              </p>
            </div>
            <div className="stat-card-light-blue rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={18} style={{ color: "var(--primary)" }} />
                <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                  Clusters
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {research.keyword_clusters.length}
              </p>
            </div>
            <div className="stat-card-emerald rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} style={{ color: "var(--success)" }} />
                <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                  Articles Needed
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {research.estimated_articles_needed}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl w-fit animate-fade-in" style={{ background: "rgba(255,255,255,0.04)" }}>
            {([
              { id: "keywords" as const, label: "Keywords & Intents", icon: Tag },
              { id: "topical_map" as const, label: "Topical Map", icon: Map },
              { id: "gaps" as const, label: "Content Gaps", icon: Zap },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? "var(--primary-light)" : "transparent",
                  color: activeTab === tab.id ? "var(--primary)" : "var(--foreground-muted)",
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Keywords */}
          {activeTab === "keywords" && (
            <div
              className="rounded-2xl overflow-hidden animate-fade-in"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
              }}
            >
              {/* Table Header */}
              <div
                className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider"
                style={{
                  color: "var(--foreground-subtle)",
                  borderBottom: "1px solid var(--card-border)",
                }}
              >
                <div className="col-span-5">Keyword</div>
                <div className="col-span-2 text-center">Intent</div>
                <div className="col-span-2 text-center">Difficulty</div>
                <div className="col-span-3 text-center">Priority</div>
              </div>

              {research.search_intents.map((intent, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 px-6 py-3 items-center transition-all duration-150 animate-fade-in"
                  style={{
                    borderBottom: "1px solid var(--card-border)",
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <div className="col-span-5">
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>
                      {intent.keyword}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: `${intentColors[intent.intent] || "var(--foreground-subtle)"}15`,
                        color: intentColors[intent.intent] || "var(--foreground-subtle)",
                      }}
                    >
                      {intent.intent}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                      {intent.difficulty}
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: `${priorityColors[intent.priority] || "var(--foreground-subtle)"}15`,
                        color: priorityColors[intent.priority] || "var(--foreground-subtle)",
                      }}
                    >
                      {intent.priority.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Topical Map */}
          {activeTab === "topical_map" && topicalMap && (
            <div
              className="rounded-2xl p-4 animate-fade-in"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="flex items-center justify-between mb-4 px-3">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Topical Authority Map
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--foreground-subtle)" }}>
                    {topicalMap.total_articles} articles • {topicalMap.coverage_strategy}
                  </p>
                </div>
              </div>
              <TopicTreeNode node={topicalMap.pillar} />
            </div>
          )}

          {/* Tab: Content Gaps */}
          {activeTab === "gaps" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {/* Gaps */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <Zap size={16} style={{ color: "var(--warning)" }} />
                  Content Gaps
                </h3>
                <div className="space-y-2">
                  {research.content_gaps.map((gap, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                      style={{
                        background: "var(--warning-light)",
                        color: "var(--warning)",
                      }}
                    >
                      <span className="mt-0.5">⚡</span>
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Angles */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <TrendingUp size={16} style={{ color: "var(--success)" }} />
                  Recommended Angles
                </h3>
                <div className="space-y-2">
                  {research.recommended_angles.map((angle, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                      style={{
                        background: "var(--success-light)",
                        color: "var(--success)",
                      }}
                    >
                      <span className="mt-0.5">💡</span>
                      <span>{angle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
