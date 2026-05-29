// ========================================
// Shared TypeScript Types
// Semantic Content & Entity SEO Platform
// ========================================

export type UserRole = "admin" | "editor" | "writer";

export type ArticleStatus = "draft" | "in_review" | "approved" | "published";

export type EntityPriority = "must_have" | "should_have" | "nice_to_have";

export type EntityType =
  | "person"
  | "organization"
  | "place"
  | "concept"
  | "product"
  | "event"
  | "other";

export type ReviewDecision = "approved" | "changes_requested";

export type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

// --- User & Team ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
}

// --- Article ---

export interface Article {
  id: string;
  title: string;
  slug: string;
  contentMd: string;
  status: ArticleStatus;
  authorId: string;
  author?: User;
  projectId?: string;
  seoMeta?: SeoMeta;
  eeatScores?: EeatScores;
  contentScore: number;
  entityMapId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeoMeta {
  titleTag: string;
  metaDescription: string;
  faqSchema?: FaqItem[];
  slug: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface EeatScores {
  experience: number;
  expertise: number;
  authoritativeness: number;
  trustworthiness: number;
  overall: number;
}

// --- Entity ---

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  priority: EntityPriority;
  isEmbedded?: boolean;
  relationships?: EntityRelation[];
}

export interface EntityRelation {
  targetEntityId: string;
  targetEntityName: string;
  relationType: string;
}

export interface EntityMap {
  id: string;
  articleId: string;
  entities: Entity[];
  relationships: EntityRelation[];
}

// --- Project & Topical Map ---

export interface Project {
  id: string;
  name: string;
  seedKeyword: string;
  teamId: string;
  createdAt: Date;
}

export interface TopicNode {
  id: string;
  keyword: string;
  intent: SearchIntent;
  children?: TopicNode[];
  articleId?: string;
  isCovered: boolean;
}

// --- Review ---

export interface Review {
  id: string;
  articleId: string;
  reviewerId: string;
  reviewer?: User;
  decision: ReviewDecision;
  comments: string;
  createdAt: Date;
}

// --- E-E-A-T Framework ---

export interface EeatCriterion {
  id: string;
  category: "experience" | "expertise" | "authoritativeness" | "trustworthiness";
  label: string;
  description: string;
  required: boolean;
}

export interface EeatFramework {
  id: string;
  name: string;
  isDefault: boolean;
  teamId: string;
  criteria: EeatCriterion[];
}

// --- E-E-A-T Suggestion ---

export interface EeatSuggestion {
  category: EeatCriterion["category"];
  message: string;
  severity: "required" | "recommended" | "optional";
  isResolved: boolean;
}

// --- Knowledge Base ---

export interface KbDocument {
  id: string;
  filename: string;
  filetype: string;
  tags: string[];
  teamId: string;
  createdAt: Date;
}

export interface KbEntity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  source: "manual" | "csv" | "document";
  teamId: string;
}

// --- WordPress ---

export interface WpSite {
  id: string;
  siteUrl: string;
  teamId: string;
  name: string;
}

// --- Navigation ---

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  requiredRole?: UserRole;
}

// --- Dashboard Stats ---

export interface DashboardStats {
  totalArticles: number;
  inReview: number;
  approved: number;
  published: number;
  avgEeatScore: number;
  topicalCoverage: number;
}
