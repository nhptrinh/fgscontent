// ========================================
// Draft Storage (localStorage)
// FoogleSEO — Semantic Content Platform
// ========================================

export interface Draft {
  id: string;
  title: string;
  content: string;
  status: "draft" | "in_review" | "approved" | "published";
  author: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  contentScore: number | null;
  eeatScore: number | null;
  model: string;
  language: string;
}

const STORAGE_KEY = "foogleseo_drafts";

function getDraftsFromStorage(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDraftsToStorage(drafts: Draft[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

/**
 * Get all drafts
 */
export function getAllDrafts(): Draft[] {
  return getDraftsFromStorage().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Get a single draft by ID
 */
export function getDraft(id: string): Draft | null {
  const drafts = getDraftsFromStorage();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Save or update a draft
 */
export function saveDraft(draft: Partial<Draft> & { title: string; content: string }): Draft {
  const drafts = getDraftsFromStorage();
  const now = new Date().toISOString();
  const wordCount = draft.content.split(/\s+/).filter(Boolean).length;

  if (draft.id) {
    // Update existing
    const index = drafts.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      drafts[index] = {
        ...drafts[index],
        ...draft,
        updatedAt: now,
        wordCount,
      };
      saveDraftsToStorage(drafts);
      return drafts[index];
    }
  }

  // Create new
  const newDraft: Draft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: draft.title || "Untitled",
    content: draft.content,
    status: "draft",
    author: "Current User",
    createdAt: now,
    updatedAt: now,
    wordCount,
    contentScore: draft.contentScore ?? null,
    eeatScore: draft.eeatScore ?? null,
    model: draft.model || "google/gemini-2.5-flash",
    language: draft.language || "Vietnamese",
  };

  drafts.push(newDraft);
  saveDraftsToStorage(drafts);
  return newDraft;
}

/**
 * Delete a draft
 */
export function deleteDraft(id: string): void {
  const drafts = getDraftsFromStorage().filter((d) => d.id !== id);
  saveDraftsToStorage(drafts);
}

/**
 * Update draft status
 */
export function updateDraftStatus(
  id: string,
  status: Draft["status"]
): Draft | null {
  const drafts = getDraftsFromStorage();
  const index = drafts.findIndex((d) => d.id === id);
  if (index < 0) return null;
  drafts[index].status = status;
  drafts[index].updatedAt = new Date().toISOString();
  saveDraftsToStorage(drafts);
  return drafts[index];
}
