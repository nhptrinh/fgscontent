"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import type { ArticleStatus } from "@/types";

const mockArticles = [
  {
    id: "1",
    title: "Hướng dẫn Entity SEO toàn diện 2026",
    status: "in_review" as ArticleStatus,
    author: "Writer A",
    updatedAt: "2026-05-29T10:00:00Z",
    contentScore: 85,
    eeatScore: 8.5,
    wordCount: 3200,
  },
  {
    id: "2",
    title: "Topical Authority: Chiến lược phủ kín chủ đề",
    status: "draft" as ArticleStatus,
    author: "Writer B",
    updatedAt: "2026-05-28T14:30:00Z",
    contentScore: 62,
    eeatScore: 6.8,
    wordCount: 1800,
  },
  {
    id: "3",
    title: "E-E-A-T Framework cho ngành Healthcare",
    status: "approved" as ArticleStatus,
    author: "Writer A",
    updatedAt: "2026-05-27T09:15:00Z",
    contentScore: 91,
    eeatScore: 9.1,
    wordCount: 4100,
  },
  {
    id: "4",
    title: "Semantic Search và tương lai của SEO",
    status: "published" as ArticleStatus,
    author: "Writer C",
    updatedAt: "2026-05-26T16:45:00Z",
    contentScore: 88,
    eeatScore: 8.8,
    wordCount: 2900,
  },
  {
    id: "5",
    title: "Knowledge Graph Optimization cho doanh nghiệp",
    status: "published" as ArticleStatus,
    author: "Writer B",
    updatedAt: "2026-05-25T11:20:00Z",
    contentScore: 79,
    eeatScore: 7.5,
    wordCount: 2500,
  },
  {
    id: "6",
    title: "Google SGE và chiến lược GEO mới nhất",
    status: "draft" as ArticleStatus,
    author: "Writer A",
    updatedAt: "2026-05-24T08:00:00Z",
    contentScore: 45,
    eeatScore: 5.2,
    wordCount: 900,
  },
];

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

  const filteredArticles = mockArticles.filter((article) => {
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
              No articles found
            </p>
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <Link
              key={article.id}
              href={`/content/${article.id}`}
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
                <p className="text-xs mt-0.5" style={{ color: "var(--foreground-subtle)" }}>
                  by {article.author}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-2 text-center">
                <span
                  className={`${statusConfig[article.status].class} text-xs font-medium px-2.5 py-1 rounded-full`}
                >
                  {statusConfig[article.status].label}
                </span>
              </div>

              {/* Content Score */}
              <div className="col-span-1 text-center">
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
              </div>

              {/* E-E-A-T Score */}
              <div className="col-span-1 text-center">
                <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                  {article.eeatScore}
                </span>
              </div>

              {/* Word Count */}
              <div className="col-span-1 text-center">
                <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                  {(article.wordCount / 1000).toFixed(1)}k
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
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--foreground-muted)" }}
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
