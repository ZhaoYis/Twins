import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

// Users table (managed by NextAuth)
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
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

// Type exports
export type User = typeof users.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type StyleProfile = typeof styleProfiles.$inferSelect;
export type GeneratedContent = typeof generatedContent.$inferSelect;
