"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  CheckCircle2,
  Rocket,
  Plus,
  Search,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import type { ArticleStatus, DashboardStats } from "@/types";

// Mock data for Phase 1
const mockStats: DashboardStats = {
  totalArticles: 12,
  inReview: 3,
  approved: 5,
  published: 24,
  avgEeatScore: 8.2,
  topicalCoverage: 78,
};

const mockRecentArticles = [
  {
    id: "1",
    title: "Hướng dẫn Entity SEO toàn diện 2026",
    status: "in_review" as ArticleStatus,
    author: "Writer A",
    updatedAt: "2026-05-29T10:00:00Z",
    contentScore: 85,
  },
  {
    id: "2",
    title: "Topical Authority: Chiến lược phủ kín chủ đề",
    status: "draft" as ArticleStatus,
    author: "Writer B",
    updatedAt: "2026-05-28T14:30:00Z",
    contentScore: 62,
  },
  {
    id: "3",
    title: "E-E-A-T Framework cho ngành Healthcare",
    status: "approved" as ArticleStatus,
    author: "Writer A",
    updatedAt: "2026-05-27T09:15:00Z",
    contentScore: 91,
  },
  {
    id: "4",
    title: "Semantic Search và tương lai của SEO",
    status: "published" as ArticleStatus,
    author: "Writer C",
    updatedAt: "2026-05-26T16:45:00Z",
    contentScore: 88,
  },
  {
    id: "5",
    title: "Knowledge Graph Optimization cho doanh nghiệp",
    status: "published" as ArticleStatus,
    author: "Writer B",
    updatedAt: "2026-05-25T11:20:00Z",
    contentScore: 79,
  },
];

const statusConfig: Record<ArticleStatus, { label: string; class: string }> = {
  draft: { label: "Draft", class: "badge-draft" },
  in_review: { label: "In Review", class: "badge-review" },
  approved: { label: "Approved", class: "badge-approved" },
  published: { label: "Published", class: "badge-published" },
};

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

function StatCard({
  icon: Icon,
  label,
  value,
  cardClass,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  cardClass: string;
  delay: number;
}) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div
      className={`${cardClass} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
        >
          <Icon size={20} style={{ color: "var(--foreground)" }} />
        </div>
        <ArrowUpRight size={16} style={{ color: "var(--foreground-muted)" }} />
      </div>
      <p
        className="text-3xl font-bold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {animatedValue}
      </p>
      <p
        className="text-sm mt-1"
        style={{ color: "var(--foreground-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}

function ScoreGauge({
  label,
  value,
  max,
  suffix,
  color,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  color: string;
}) {
  const percentage = (value / max) * 100;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {value}{suffix}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255, 255, 255, 0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Welcome back! 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Here&apos;s what&apos;s happening with your content today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Articles"
          value={mockStats.totalArticles}
          cardClass="stat-card-blue"
          delay={0}
        />
        <StatCard
          icon={Eye}
          label="In Review"
          value={mockStats.inReview}
          cardClass="stat-card-amber"
          delay={100}
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={mockStats.approved}
          cardClass="stat-card-light-blue"
          delay={200}
        />
        <StatCard
          icon={Rocket}
          label="Published"
          value={mockStats.published}
          cardClass="stat-card-emerald"
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles — 2/3 width */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            animationDelay: "200ms",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Recent Articles
            </h2>
            <Link
              href="/content/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "var(--primary-gradient)",
                color: "white",
              }}
            >
              <Plus size={16} />
              New Article
            </Link>
          </div>

          <div className="space-y-1">
            {mockRecentArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/content/${article.id}`}
                className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${300 + index * 80}ms` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Score indicator */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      article.contentScore >= 80
                        ? "var(--success-light)"
                        : article.contentScore >= 60
                        ? "var(--warning-light)"
                        : "var(--danger-light)",
                    color:
                      article.contentScore >= 80
                        ? "var(--success)"
                        : article.contentScore >= 60
                        ? "var(--warning)"
                        : "var(--danger)",
                  }}
                >
                  {article.contentScore}
                </div>

                {/* Title & Author */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate group-hover:text-white transition-colors"
                    style={{ color: "var(--foreground)" }}
                  >
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                      {article.author}
                    </span>
                    <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                      •
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: "var(--foreground-subtle)" }}>
                      <Clock size={11} />
                      {new Date(article.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`${statusConfig[article.status].class} text-xs font-medium px-2.5 py-1 rounded-full`}
                >
                  {statusConfig[article.status].label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column — Score Gauges + Quick Actions */}
        <div className="space-y-6">
          {/* Score Gauges */}
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              animationDelay: "400ms",
            }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <TrendingUp size={18} style={{ color: "var(--primary)" }} />
              Performance
            </h2>

            <ScoreGauge
              label="Topical Coverage"
              value={mockStats.topicalCoverage}
              max={100}
              suffix="%"
              color="var(--primary)"
            />

            <ScoreGauge
              label="E-E-A-T Average"
              value={mockStats.avgEeatScore}
              max={10}
              suffix="/10"
              color="var(--secondary)"
            />

            <ScoreGauge
              label="Content Quality"
              value={82}
              max={100}
              suffix="/100"
              color="var(--success)"
            />
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl p-6 animate-fade-in"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              animationDelay: "500ms",
            }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: "var(--foreground)" }}>
              <Shield size={18} style={{ color: "var(--accent)" }} />
              Quick Actions
            </h2>

            <div className="space-y-2">
              {[
                { label: "New Article", href: "/content/new", icon: Plus },
                { label: "Research Keywords", href: "/research", icon: Search },
                { label: "Review Queue", href: "/content?status=in_review", icon: Eye },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--sidebar-item-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <action.icon size={18} style={{ color: "var(--primary)" }} />
                  <span style={{ color: "var(--foreground-muted)" }} className="group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--foreground-subtle)" }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
