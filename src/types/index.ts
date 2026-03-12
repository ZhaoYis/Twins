import { z } from "zod";

// AI Provider types
export const aiProviderSchema = z.enum(["openai", "anthropic"]);
export type AIProvider = z.infer<typeof aiProviderSchema>;

// API Key schemas
export const apiKeySchema = z.object({
  provider: aiProviderSchema,
  key: z.string().min(1, "API key is required"),
});

export type ApiKeyInput = z.infer<typeof apiKeySchema>;

// Article schemas
export const articleSourceSchema = z.enum(["url", "file", "paste"]);
export type ArticleSource = z.infer<typeof articleSourceSchema>;

export const createArticleSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  sourceType: articleSourceSchema,
  sourceUrl: z.string().url().optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

// Style Profile types
export interface ToneAnalysis {
  formality: number; // 0-10 scale
  emotionalTone: string[];
  audienceAwareness: string;
}

export interface StructurePatterns {
  avgSentenceLength: number;
  avgParagraphLength: number;
  transitionStyle: string;
  organizationPattern: string;
}

export interface VocabularyPreferences {
  complexity: string;
  technicalLevel: string;
  commonPhrases: string[];
  wordPreferences: string[];
}

export interface WritingQuirks {
  punctuationStyle: string;
  signaturePhrases: string[];
  uniqueElements: string[];
}

// Content Generation schemas
export const generateContentSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  provider: aiProviderSchema.optional().default("openai"),
  providerId: z.string().optional(), // ID of the provider (platform or user key) to use
});

export type GenerateContentInput = z.infer<typeof generateContentSchema>;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Style DNA full profile
export interface StyleDNA {
  tone: ToneAnalysis;
  structure: StructurePatterns;
  vocabulary: VocabularyPreferences;
  quirks: WritingQuirks;
  rawAnalysis: string;
}
