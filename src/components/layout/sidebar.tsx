"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Research",
    href: "/research",
    icon: Search,
  },
  {
    label: "Content",
    href: "/content",
    icon: FileText,
    badge: 3,
  },
  {
    label: "Knowledge Base",
    href: "/kb",
    icon: BookOpen,
  },
  {
    label: "Team",
    href: "/team",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: "var(--primary-gradient)" }}>
          <Image
            src="/icon.png"
            alt="FoogleSEO"
            width={36}
            height={36}
            className="w-7 h-7 object-contain"
          />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold tracking-tight">
              <span style={{ color: "#4AA5E2" }}>foogle</span>
              <span style={{ color: "#0C2340", WebkitTextStroke: "0.5px #4AA5E2" }}>seo</span>
            </h1>
            <p className="text-[10px]" style={{ color: "var(--foreground-subtle)" }}>
              Semantic Content Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{
                color: isActive ? "var(--foreground)" : "var(--foreground-muted)",
                background: isActive ? "var(--sidebar-item-active)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--sidebar-item-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "var(--secondary)" }}
                />
              )}

              <Icon
                size={20}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )}
                style={isActive ? { color: "var(--secondary)" } : undefined}
              />

              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}

              {/* Badge */}
              {item.badge && !collapsed && (
                <span
                  className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--primary-light)",
                    color: "var(--secondary)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 mb-2"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-item-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>

        {/* User info */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-item-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "var(--primary-gradient)" }}
          >
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                Admin User
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--foreground-subtle)" }}>
                admin@team.com
              </p>
            </div>
          )}
          {!collapsed && (
            <LogOut
              size={16}
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: "var(--foreground-muted)" }}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
