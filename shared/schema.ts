import { pgTable, serial, text, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  fileName: varchar('file_name', { length: 256 }).notNull(),
  s3Key: text('s3_key').notNull(),
  parsedContent: text('parsed_content'),
  atsScore: integer('ats_score'),
  skillProfile: jsonb('skill_profile'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  tailoredContent: text('tailored_content'),
  improvements: jsonb('improvements'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
