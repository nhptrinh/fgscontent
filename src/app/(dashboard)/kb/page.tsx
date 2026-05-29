import { BookOpen, FileUp, Database, Table2 } from "lucide-react";

export default function KnowledgeBasePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Knowledge Base
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
          Manage your internal documents, entities, and knowledge sources.
        </p>
      </div>

      <div
        className="rounded-2xl p-12 text-center animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          animationDelay: "100ms",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
          style={{ background: "var(--accent-light)" }}
        >
          <BookOpen size={28} style={{ color: "var(--accent)" }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
          Knowledge Base Module
        </h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--foreground-muted)" }}>
          Document uploads, manual entity management, and CSV import will be available in Phase 3.
        </p>

        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: FileUp, label: "Upload Docs" },
            { icon: Database, label: "Entity Manager" },
            { icon: Table2, label: "CSV Import" },
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255, 255, 255, 0.04)" }}
              >
                <feature.icon size={18} style={{ color: "var(--foreground-subtle)" }} />
              </div>
              <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
