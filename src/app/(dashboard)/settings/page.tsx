"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Globe,
  Bot,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import ModelSelector from "@/components/ai/model-selector";
import { DEFAULT_MODELS } from "@/lib/models";

export default function SettingsPage() {
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "connected" | "error"
  >("idle");
  const [connectionDetails, setConnectionDetails] = useState("");

  const testConnection = async () => {
    setConnectionStatus("testing");
    try {
      const res = await fetch("/api/test-connection");
      const data = await res.json();
      if (data.ok) {
        setConnectionStatus("connected");
        setConnectionDetails(`${data.models} models available`);
      } else {
        setConnectionStatus("error");
        setConnectionDetails(data.error || "Connection failed");
      }
    } catch {
      setConnectionStatus("error");
      setConnectionDetails("Network error");
    }
  };

  // Auto-test on mount
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
          Configure your platform, API keys, and preferences.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* OpenRouter */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--primary-light)" }}
            >
              <Key size={18} style={{ color: "var(--primary)" }} />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                OpenRouter API
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--foreground-subtle)" }}
              >
                Unified LLM gateway for all AI features
              </p>
            </div>
            <button
              onClick={testConnection}
              disabled={connectionStatus === "testing"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background:
                  connectionStatus === "connected"
                    ? "var(--success-light)"
                    : connectionStatus === "error"
                    ? "var(--danger-light)"
                    : "var(--primary-light)",
                color:
                  connectionStatus === "connected"
                    ? "var(--success)"
                    : connectionStatus === "error"
                    ? "var(--danger)"
                    : "var(--primary)",
              }}
            >
              {connectionStatus === "testing" && (
                <Loader2 size={12} className="animate-spin" />
              )}
              {connectionStatus === "connected" && <CheckCircle2 size={12} />}
              {connectionStatus === "error" && <XCircle size={12} />}
              {connectionStatus === "idle" && <Key size={12} />}
              {connectionStatus === "testing"
                ? "Testing..."
                : connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "error"
                ? "Error"
                : "Test"}
            </button>
          </div>

          <div className="px-6 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  API Key
                </p>
                <p
                  className="text-xs mt-0.5 font-mono"
                  style={{ color: "var(--foreground-subtle)" }}
                >
                  sk-or-v1-•••••••••a7bc
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      connectionStatus === "connected"
                        ? "var(--success)"
                        : "var(--foreground-subtle)",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color:
                      connectionStatus === "connected"
                        ? "var(--success)"
                        : "var(--foreground-subtle)",
                  }}
                >
                  {connectionStatus === "connected"
                    ? connectionDetails
                    : connectionStatus === "error"
                    ? connectionDetails
                    : "Not verified"}
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid var(--card-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Default Model
              </p>
              <ModelSelector
                value={DEFAULT_MODELS.content}
                onChange={() => {}}
                className="w-52"
              />
            </div>
          </div>
        </div>

        {/* DataForSEO */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            animationDelay: "100ms",
          }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--secondary-light)" }}
            >
              <Globe size={18} style={{ color: "var(--secondary)" }} />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                DataForSEO (Optional)
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--foreground-subtle)" }}
              >
                Real SERP data for keyword research
              </p>
            </div>
            <a
              href="https://dataforseo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: "var(--primary)" }}
            >
              Get API Key
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="px-6 py-3 space-y-3">
            <div>
              <label
                className="text-xs font-medium block mb-1.5"
                style={{ color: "var(--foreground-muted)" }}
              >
                Login
              </label>
              <input
                type="text"
                placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <div>
              <label
                className="text-xs font-medium block mb-1.5"
                style={{ color: "var(--foreground-muted)" }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="API password"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <p
              className="text-[11px]"
              style={{ color: "var(--foreground-subtle)" }}
            >
              Not configured. AI-powered research is available without DataForSEO.
            </p>
          </div>
        </div>

        {/* WordPress */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            animationDelay: "200ms",
          }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--success-light)" }}
            >
              <Globe size={18} style={{ color: "var(--success)" }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                WordPress Sites
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--foreground-subtle)" }}
              >
                1-click publishing via WordPress REST API
              </p>
            </div>
          </div>

          <div className="px-6 py-4">
            <p
              className="text-xs"
              style={{ color: "var(--foreground-subtle)" }}
            >
              No sites connected. WordPress integration will be available in Phase 4.
            </p>
          </div>
        </div>

        {/* E-E-A-T Framework */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            animationDelay: "300ms",
          }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--warning-light)" }}
            >
              <Shield size={18} style={{ color: "var(--warning)" }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                E-E-A-T Frameworks
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--foreground-subtle)" }}
              >
                Custom evaluation frameworks for content quality
              </p>
            </div>
          </div>

          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Default Framework
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--foreground-subtle)" }}
                >
                  Built-in (12 criteria across 4 E-E-A-T pillars)
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--success)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--success)" }}
                >
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
