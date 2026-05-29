"use client";

import { Bell, Search, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/research": "Keyword & Topic Research",
  "/content": "Content",
  "/content/new": "New Article",
  "/kb": "Knowledge Base",
  "/team": "Team Management",
  "/settings": "Settings",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export default function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b backdrop-blur-xl"
      style={{
        background: "rgba(6, 13, 23, 0.85)",
        borderColor: "var(--border)",
      }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight size={14} style={{ color: "var(--foreground-subtle)" }} />
            )}
            <span
              className={
                index === breadcrumbs.length - 1
                  ? "font-semibold"
                  : "transition-colors hover:text-white cursor-pointer"
              }
              style={{
                color:
                  index === breadcrumbs.length - 1
                    ? "var(--foreground)"
                    : "var(--foreground-muted)",
              }}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--input-border)",
            color: "var(--foreground-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--input-border)";
          }}
        >
          <Search size={14} />
          <span className="hidden md:inline">Search...</span>
          <kbd
            className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              color: "var(--foreground-subtle)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-all duration-200"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-item-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </button>
      </div>
    </header>
  );
}
