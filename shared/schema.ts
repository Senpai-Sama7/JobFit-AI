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

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

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

export const roleRecommendations = pgTable('role_recommendations', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').references(() => resumes.id).notNull(),
  jobTitle: varchar('job_title', { length: 256 }),
  companyName: varchar('company_name', { length: 256 }),
  fitScore: integer('fit_score'),
  description: text('description'),
  source: text('source'),
});

export const tailoredResumes = pgTable('tailored_resumes', {
  id: serial('id').primaryKey(),
  originalResumeId: integer('resume_id').references(() => resumes.id).notNull(),
  jobDescription: text('job_description').notNull(),
  tailoredContent: jsonb('tailored_content'),
  improvements: jsonb('improvements'),
  atsScore: integer('ats_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
// ------- Types -------
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

export interface SkillProfile {
  skills: string[];
}

export interface ParsedResume {
  [key: string]: any;
}
