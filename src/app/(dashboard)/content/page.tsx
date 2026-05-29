"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Clock,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { ArticleStatus } from "@/types";
import { getAllDrafts, deleteDraft, type Draft } from "@/lib/drafts";

interface ArticleItem {
  id: string;
  title: string;
  status: ArticleStatus;
  author: string;
  updatedAt: string;
  contentScore: number | null;
  eeatScore: number | null;
  wordCount: number;
  isDraft?: boolean;
}

const statusConfig: Record<ArticleStatus, { label: string; class: string }> = {
  draft: { label: "Draft", class: "badge-draft" },
  in_review: { label: "In Review", class: "badge-review" },
  approved: { label: "Approved", class: "badge-approved" },
  published: { label: "Published", class: "badge-published" },
};

const statusFilters: { label: string; value: ArticleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "in_review" },
  { label: "Approved", value: "approved" },
  { label: "Published", value: "published" },
];

export default function ContentListPage() {
  const [activeFilter, setActiveFilter] = useState<ArticleStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load drafts from localStorage on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    const drafts = getAllDrafts();
    const draftArticles: ArticleItem[] = drafts.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status as ArticleStatus,
      author: d.author,
      updatedAt: d.updatedAt,
      contentScore: d.contentScore,
      eeatScore: d.eeatScore,
      wordCount: d.wordCount,
      isDraft: true,
    }));
    setArticles(draftArticles);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (deleteConfirm === id) {
      deleteDraft(id);
      loadArticles();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesStatus = activeFilter === "all" || article.status === activeFilter;
    const matchesSearch =
      !searchQuery || article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Content
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
            Manage and create your SEO-optimized articles.
          </p>
        </div>
        <Link
          href="/content/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          style={{
            background: "var(--primary-gradient)",
            color: "white",
          }}
        >
          <Plus size={18} />
          New Article
        </Link>
      </div>

      {/* Filters & Search */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          animationDelay: "100ms",
        }}
      >
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: activeFilter === filter.value ? "var(--primary-light)" : "transparent",
                color: activeFilter === filter.value ? "var(--primary)" : "var(--foreground-muted)",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative w-full sm:w-auto">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--foreground-subtle)" }}
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-200"
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
          />
        </div>
      </div>

      {/* Articles Table */}
      <div
        className="rounded-2xl overflow-hidden animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          animationDelay: "200ms",
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
          <div className="col-span-5">Article</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-1 text-center">E-E-A-T</div>
          <div className="col-span-1 text-center">Words</div>
          <div className="col-span-1 text-center">Updated</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {/* Table Body */}
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} style={{ color: "var(--foreground-subtle)" }} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              {articles.length === 0
                ? "No articles yet. Create your first article!"
                : "No articles match your filter"}
            </p>
            {articles.length === 0 && (
              <Link
                href="/content/new"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: "var(--primary-gradient)",
                  color: "white",
                }}
              >
                <Plus size={16} />
                Create Article
              </Link>
            )}
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <Link
              key={article.id}
              href={`/content/new?id=${article.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 group animate-fade-in"
              style={{
                borderBottom: "1px solid var(--card-border)",
                animationDelay: `${250 + index * 60}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Title & Author */}
              <div className="col-span-5">
                <p
                  className="text-sm font-medium truncate group-hover:text-white transition-colors"
                  style={{ color: "var(--foreground)" }}
                >
                  {article.title}
                </p>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--foreground-subtle)" }}>
                  by {article.author}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-2 text-center">
                <span
                  className={`${statusConfig[article.status]?.class || "badge-draft"} text-xs font-medium px-2.5 py-1 rounded-full`}
                >
                  {statusConfig[article.status]?.label || "Draft"}
                </span>
              </div>

              {/* Content Score */}
              <div className="col-span-1 text-center">
                {article.contentScore !== null ? (
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        article.contentScore >= 80
                          ? "var(--success)"
                          : article.contentScore >= 60
                          ? "var(--warning)"
                          : "var(--danger)",
                    }}
                  >
                    {article.contentScore}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                    —
                  </span>
                )}
              </div>

              {/* E-E-A-T Score */}
              <div className="col-span-1 text-center">
                {article.eeatScore !== null ? (
                  <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                    {article.eeatScore}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                    —
                  </span>
                )}
              </div>

              {/* Word Count */}
              <div className="col-span-1 text-center">
                <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                  {article.wordCount > 1000
                    ? `${(article.wordCount / 1000).toFixed(1)}k`
                    : article.wordCount}
                </span>
              </div>

              {/* Updated */}
              <div className="col-span-1 text-center">
                <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                  {new Date(article.updatedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 text-center">
                <button
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  style={{
                    color: deleteConfirm === article.id ? "var(--danger)" : "var(--foreground-muted)",
                    background: deleteConfirm === article.id ? "var(--danger-light)" : "transparent",
                  }}
                  onClick={(e) => handleDelete(article.id, e)}
                  title={deleteConfirm === article.id ? "Click again to confirm delete" : "Delete draft"}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
