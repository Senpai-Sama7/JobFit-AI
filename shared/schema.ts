import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// ========================
// USER TABLE
// ========================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  // Subscription fields
  subscriptionStatus: varchar('subscription_status', { length: 20 }).default('free').notNull(),
  subscriptionExpiry: timestamp('subscription_expiry'),
  resumeGenerationsUsed: integer('resume_generations_used').default(0).notNull(),
  resumeGenerationsLimit: integer('resume_generations_limit').default(1).notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========================
// RESUMES TABLE
// ========================
export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  originalFileName: varchar('original_file_name', { length: 256 }),
  s3Key: text('s3_key').notNull(),
  parsedData: jsonb('parsed_data'),
  atsScore: integer('ats_score'),
  skillProfile: jsonb('skill_profile'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========================
// ROLE RECOMMENDATIONS TABLE
// ========================
export const roleRecommendations = pgTable('role_recommendations', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').references(() => resumes.id).notNull(),
  jobTitle: varchar('job_title', { length: 256 }),
  companyName: varchar('company_name', { length: 256 }),
  fitScore: integer('fit_score'),
  description: text('description'),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================
// TAILORED RESUMES TABLE
// ========================
export const tailoredResumes = pgTable('tailored_resumes', {
  id: serial('id').primaryKey(),
  originalResumeId: integer('resume_id').references(() => resumes.id).notNull(),
  jobDescription: text('job_description').notNull(),
  tailoredContent: jsonb('tailored_content'),
  improvements: jsonb('improvements'),
  atsScore: integer('ats_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================
// ACTIVITIES TABLE
// ========================
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================
// TYPE EXPORTS - SELECT MODELS
// ========================
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type Resume = InferSelectModel<typeof resumes>;
export type InsertResume = InferInsertModel<typeof resumes>;

export type RoleRecommendation = InferSelectModel<typeof roleRecommendations>;
export type InsertRoleRecommendation = InferInsertModel<typeof roleRecommendations>;

export type TailoredResume = InferSelectModel<typeof tailoredResumes>;
export type InsertTailoredResume = InferInsertModel<typeof tailoredResumes>;

export type Activity = InferSelectModel<typeof activities>;
export type InsertActivity = InferInsertModel<typeof activities>;

// ========================
// SHARED INTERFACES
// ========================

/**
 * Skill profile containing extracted skills from a resume
 */
export interface SkillProfile {
  skills: string[];
}

/**
 * Contact information from a parsed resume
 */
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

/**
 * Work experience entry from a parsed resume
 */
export interface ExperienceEntry {
  role: string;
  title?: string; // Alias for role
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  details?: string[]; // Alias for bullets
  bullets?: string[];
}

/**
 * Education entry from a parsed resume
 */
export interface EducationEntry {
  degree: string;
  institution: string;
  graduationDate?: string;
  gpa?: string;
}

/**
 * Certification entry
 */
export interface CertificationEntry {
  name: string;
  issuer: string;
  date?: string;
}

/**
 * Structured parsed resume data
 */
export interface ParsedResume {
  contact: ContactInfo;
  summary?: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications?: CertificationEntry[];
  text?: string; // Raw text version
  feedback?: string | null;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Subscription tier types
 */
export type SubscriptionStatus = 'free' | 'plus' | 'pro';

/**
 * Subscription tier limits configuration
 */
export const SUBSCRIPTION_LIMITS: Record<SubscriptionStatus, {
  resumeGenerations: number;
  price: number;
  features: string[];
}> = {
  free: {
    resumeGenerations: 1,
    price: 0,
    features: [
      'Upload 1 resume',
      'Basic ATS scoring',
      'View top 3 role matches',
    ],
  },
  plus: {
    resumeGenerations: 10,
    price: 0.99,
    features: [
      'Upload up to 10 resumes',
      'Advanced ATS scoring',
      'Unlimited role matches',
      'Resume tailoring',
      'Export to all formats',
      'Job market trends',
    ],
  },
  pro: {
    resumeGenerations: 30,
    price: 4.99,
    features: [
      'Upload up to 30 resumes',
      'Premium ATS scoring',
      'Unlimited role matches',
      'Advanced resume tailoring',
      'Export to all formats',
      'Job market trends',
      'AI interview prep sheets',
      'Job board integration',
      'Priority support',
    ],
  },
};
