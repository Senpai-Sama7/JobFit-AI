import { db } from './db';
import {
  users,
  resumes,
  roleRecommendations,
  tailoredResumes,
  activities,
  type User,
  type InsertUser,
  type Resume,
  type InsertResume,
  type RoleRecommendation,
  type InsertRoleRecommendation,
  type TailoredResume,
  type InsertTailoredResume,
  type Activity,
  type InsertActivity,
  type ParsedResume,
  type SkillProfile
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { IStorage } from './storage';

export class PgStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUserSubscription(id: number, subscriptionData: {
    subscriptionStatus: "free" | "plus" | "pro";
    subscriptionExpiry?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(subscriptionData)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Resumes
  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return db.select().from(resumes).where(eq(resumes.userId, userId));
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [created] = await db.insert(resumes).values(resume).returning();
    return created;
  }

  async updateResume(id: number, updates: Partial<Resume>): Promise<Resume | undefined> {
    const [updated] = await db.update(resumes)
      .set(updates)
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }

  async deleteResume(id: number): Promise<boolean> {
    const result = await db.delete(resumes).where(eq(resumes.id, id));
  return !!result.rowCount;
  }

  // Role Recommendations
  async getRoleRecommendationsByResumeId(resumeId: number): Promise<RoleRecommendation[]> {
    return db.select().from(roleRecommendations).where(eq(roleRecommendations.resumeId, resumeId));
  }

  async createRoleRecommendation(recommendation: InsertRoleRecommendation): Promise<RoleRecommendation> {
    const [created] = await db.insert(roleRecommendations).values(recommendation).returning();
    return created;
  }

  async deleteRoleRecommendationsByResumeId(resumeId: number): Promise<void> {
    await db.delete(roleRecommendations).where(eq(roleRecommendations.resumeId, resumeId));
  }

  // Tailored Resumes
  async getTailoredResume(id: number): Promise<TailoredResume | undefined> {
    const [tailored] = await db.select().from(tailoredResumes).where(eq(tailoredResumes.id, id));
    return tailored;
  }

  async getTailoredResumesByResumeId(resumeId: number): Promise<TailoredResume[]> {
    return db.select().from(tailoredResumes).where(eq(tailoredResumes.originalResumeId, resumeId));
  }

  async createTailoredResume(tailoredResume: InsertTailoredResume): Promise<TailoredResume> {
    const [created] = await db.insert(tailoredResumes).values(tailoredResume).returning();
    return created;
  }

  async deleteTailoredResume(id: number): Promise<boolean> {
    const result = await db.delete(tailoredResumes).where(eq(tailoredResumes.id, id));
  return !!result.rowCount;
  }

  // Activities
  async getActivitiesByUserId(userId: number, limit: number = 10): Promise<Activity[]> {
    // Drizzle ORM does not support direct DESC in .orderBy, so sort in JS
    const rows = await db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt)
      .limit(limit);
    return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(activity).returning();
    return created;
  }
}

export const storage = new PgStorage();
