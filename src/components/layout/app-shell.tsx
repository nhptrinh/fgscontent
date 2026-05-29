"use client";

import Sidebar from "./sidebar";
import Header from "./header";

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export default function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 ml-[260px] transition-all duration-300 flex flex-col min-h-screen">
        <Header />

        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>

          {/* Optional Right Panel */}
          {rightPanel && (
            <aside
              className="w-[340px] border-l p-4 overflow-auto hidden xl:block animate-slide-right"
              style={{
                borderColor: "var(--border)",
                background: "var(--background-secondary)",
              }}
            >
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
