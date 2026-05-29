"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Zap, Star, Crown } from "lucide-react";
import { MODELS, type ModelConfig } from "@/lib/models";

const tierIcons = {
  fast: Zap,
  quality: Star,
  premium: Crown,
};

const tierLabels = {
  fast: "Fast",
  quality: "Quality",
  premium: "Premium",
};

const tierColors = {
  fast: "var(--success)",
  quality: "var(--primary)",
  premium: "var(--warning)",
};

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  className?: string;
}

export default function ModelSelector({
  value,
  onChange,
  className = "",
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = MODELS.find((m) => m.id === value) || MODELS[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const TierIcon = tierIcons[selected.tier];

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full"
        style={{
          background: "var(--input-bg)",
          border: "1px solid var(--input-border)",
          color: "var(--foreground)",
        }}
      >
        <TierIcon
          size={14}
          style={{ color: tierColors[selected.tier] }}
        />
        <span className="flex-1 text-left truncate text-xs">
          {selected.name}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--foreground-subtle)" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-72 rounded-xl overflow-hidden shadow-lg animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          {(["fast", "quality", "premium"] as const).map((tier) => {
            const tierModels = MODELS.filter((m) => m.tier === tier);
            if (tierModels.length === 0) return null;

            const Icon = tierIcons[tier];

            return (
              <div key={tier}>
                {/* Tier header */}
                <div
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  style={{
                    color: tierColors[tier],
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <Icon size={10} />
                  {tierLabels[tier]}
                </div>

                {/* Models */}
                {tierModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 transition-all duration-150 flex items-start gap-3"
                    style={{
                      background:
                        model.id === value
                          ? "var(--sidebar-item-active)"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (model.id !== value) {
                        e.currentTarget.style.background =
                          "var(--sidebar-item-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (model.id !== value) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {model.name}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            color: "var(--foreground-subtle)",
                          }}
                        >
                          {model.provider}
                        </span>
                      </div>
                      <p
                        className="text-[11px] mt-0.5 truncate"
                        style={{ color: "var(--foreground-subtle)" }}
                      >
                        {model.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
