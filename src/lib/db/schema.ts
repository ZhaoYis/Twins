import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// Users table (managed by NextAuth)
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("user").notNull(), // 'admin' | 'user'
  status: text("status").default("active").notNull(), // 'active' | 'disabled'
  subscriptionTier: text("subscription_tier").default("free").notNull(), // 'free' | 'pro' | 'enterprise'
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable("account", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// User API Keys (encrypted)
export const userApiKeys = pgTable("user_api_key", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'openai', 'anthropic'
  encryptedKey: text("encrypted_key").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Articles (uploaded content samples)
export const articles = pgTable("article", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(), // 'url', 'file', 'paste'
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Style Profiles (extracted Style DNA)
export const styleProfiles = pgTable("style_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  toneAnalysis: jsonb("tone_analysis").$type<{
    formality: number;
    emotionalTone: string[];
    audienceAwareness: string;
  }>(),
  structurePatterns: jsonb("structure_patterns").$type<{
    avgSentenceLength: number;
    avgParagraphLength: number;
    transitionStyle: string;
    organizationPattern: string;
  }>(),
  vocabularyPrefs: jsonb("vocabulary_prefs").$type<{
    complexity: string;
    technicalLevel: string;
    commonPhrases: string[];
    wordPreferences: string[];
  }>(),
  writingQuirks: jsonb("writing_quirks").$type<{
    punctuationStyle: string;
    signaturePhrases: string[];
    uniqueElements: string[];
  }>(),
  rawAnalysis: text("raw_analysis"),
  articleCount: integer("article_count").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Generated Content
export const generatedContent = pgTable("generated_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  styleProfileId: uuid("style_profile_id").references(() => styleProfiles.id),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  modelUsed: text("model_used"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Global AI Provider Configuration (admin-managed)
export const globalProviders = pgTable("global_provider", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(), // 'openai', 'anthropic'
  name: text("name").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  modelName: text("model_name"), // e.g., 'gpt-4', 'claude-3-opus'
  displayOrder: integer("display_order").default(0),
  allowedTiers: jsonb("allowed_tiers").$type<string[]>().default(["free", "pro", "enterprise"]),
  isActive: boolean("is_active").default(true).notNull(),
  rateLimit: integer("rate_limit"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Character/Role definitions for content generation
export const characters = pgTable("character", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  stylePrompt: text("style_prompt").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// User-Character assignments
export const userCharacters = pgTable("user_character", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at", { mode: "date" }).defaultNow(),
});

// Admin action logs
export const adminLogs = pgTable("admin_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type"), // 'user', 'provider', 'content', 'profile', 'character'
  targetId: text("target_id"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plan", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // 'free', 'pro', 'enterprise'
  displayName: text("display_name").notNull(), // '免费版', '专业版', '企业版'
  price: integer("price").notNull().default(0), // Price in cents
  tokensPerMonth: integer("tokens_per_month"), // Monthly token quota
  maxTeamMembers: integer("max_team_members").default(1),
  canAddOwnProviders: boolean("can_add_own_providers").default(false),
  features: jsonb("features").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// User Subscriptions
export const userSubscriptions = pgTable("user_subscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  status: text("status").notNull().default("active"), // 'active', 'cancelled', 'expired'
  tokensUsed: integer("tokens_used").default(0),
  tokensRemaining: integer("tokens_remaining").default(0),
  currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Token Usage Logs
export const tokenUsageLogs = pgTable("token_usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => userSubscriptions.id),
  providerId: uuid("provider_id").references(() => globalProviders.id),
  tokensUsed: integer("tokens_used").notNull(),
  model: text("model"),
  requestType: text("request_type"), // 'generate', 'analyze'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type StyleProfile = typeof styleProfiles.$inferSelect;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type GlobalProvider = typeof globalProviders.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type UserCharacter = typeof userCharacters.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type TokenUsageLog = typeof tokenUsageLogs.$inferSelect;
