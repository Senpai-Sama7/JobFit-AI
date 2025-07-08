import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  subscriptionStatus: text("subscription_status", { enum: ["free", "plus", "pro"] }).default("free").notNull(),
  resumeGenerationsUsed: integer("resume_generations_used").default(0).notNull(),
  resumeGenerationsLimit: integer("resume_generations_limit").default(1).notNull(),
  subscriptionExpiry: timestamp("subscription_expiry"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalFileName: text("original_file_name"),
  fileType: text("file_type").notNull(),
  rawContent: text("raw_content").notNull(),
  parsedData: jsonb("parsed_data").$type<ParsedResume>(),
  skillProfile: jsonb("skill_profile").$type<SkillProfile>(),
  atsScore: integer("ats_score"),
  processingStatus: text("processing_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roleRecommendations = pgTable("role_recommendations", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  fitScore: integer("fit_score").notNull(),
  semanticScore: integer("semantic_score").notNull(),
  keywordScore: integer("keyword_score").notNull(),
});

export const tailoredResumes = pgTable("tailored_resumes", {
  id: serial("id").primaryKey(),
  originalResumeId: integer("original_resume_id").notNull(),
  jobDescription: text("job_description").notNull(),
  tailoredContent: jsonb("tailored_content").$type<ParsedResume>(),
  improvements: jsonb("improvements").$type<TailoringImprovement[]>(),
  atsScore: integer("ats_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  originalFileName: true,
  fileType: true,
  rawContent: true,
});

export const insertRoleRecommendationSchema = createInsertSchema(roleRecommendations).omit({
  id: true,
});

export const insertTailoredResumeSchema = createInsertSchema(tailoredResumes).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type RoleRecommendation = typeof roleRecommendations.$inferSelect;
export type InsertRoleRecommendation = z.infer<typeof insertRoleRecommendationSchema>;

export type TailoredResume = typeof tailoredResumes.$inferSelect;
export type InsertTailoredResume = z.infer<typeof insertTailoredResumeSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Data structures
export interface ParsedResume {
  contact: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  extras?: string[];
}

export interface SkillProfile {
  technical: { name: string; level: number }[];
  soft: { name: string; level: number }[];
  domains: { name: string; level: number }[];
  topSkills: string[];
}

export interface TailoringImprovement {
  type: 'keyword_added' | 'bullet_reordered' | 'metric_enhanced' | 'section_optimized';
  section: string;
  original: string;
  improved: string;
  reasoning: string;
}

export interface FileUploadRequest {
  file: File;
  userId: number;
}

export interface ManualResumeRequest {
  userId: number;
  resumeData: ParsedResume;
}

export interface TailoringRequest {
  resumeId: number;
  jobDescription: string;
}

export interface ExportRequest {
  resumeId: number;
  format: 'pdf' | 'docx' | 'txt';
  template?: string;
}
