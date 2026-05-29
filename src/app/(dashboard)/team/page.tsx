"use client";

import { Users, Shield, UserPlus, Mail } from "lucide-react";

const mockTeamMembers = [
  { id: "1", name: "Admin User", email: "admin@team.com", role: "admin" as const, status: "active" },
  { id: "2", name: "Editor Nguyễn", email: "editor@team.com", role: "editor" as const, status: "active" },
  { id: "3", name: "Writer A", email: "writera@team.com", role: "writer" as const, status: "active" },
  { id: "4", name: "Writer B", email: "writerb@team.com", role: "writer" as const, status: "active" },
  { id: "5", name: "Writer C", email: "writerc@team.com", role: "writer" as const, status: "active" },
];

const roleConfig = {
  admin: { label: "Admin", color: "var(--accent)", bg: "var(--accent-light)" },
  editor: { label: "Editor", color: "var(--primary)", bg: "var(--primary-light)" },
  writer: { label: "Writer", color: "var(--success)", bg: "var(--success-light)" },
};

export default function TeamPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Team Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
            Manage team members and their roles.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: "var(--primary-gradient)",
            color: "white",
          }}
        >
          <UserPlus size={18} />
          Invite Member
        </button>
      </div>

      {/* Team Members */}
      <div
        className="rounded-2xl overflow-hidden animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          animationDelay: "100ms",
        }}
      >
        {mockTeamMembers.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-4 px-6 py-4 transition-all duration-200 animate-fade-in"
            style={{
              borderBottom: index < mockTeamMembers.length - 1 ? "1px solid var(--card-border)" : "none",
              animationDelay: `${150 + index * 80}ms`,
            }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "var(--primary-gradient)" }}
            >
              {member.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {member.name}
              </p>
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--foreground-subtle)" }}>
                <Mail size={11} />
                {member.email}
              </p>
            </div>

            {/* Role Badge */}
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: roleConfig[member.role].bg,
                color: roleConfig[member.role].color,
              }}
            >
              {roleConfig[member.role].label}
            </span>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
              <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
