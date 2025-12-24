/**
 * Storage abstraction layer for JobFit-AI
 *
 * This module provides an interface for data persistence operations.
 * Implements a database-backed storage using Drizzle ORM.
 */

import { db } from './db';
import { eq, desc } from 'drizzle-orm';
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
  type SubscriptionStatus,
} from '../shared/schema';

/**
 * Storage interface defining all data operations
 */
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(id: number, subscriptionData: {
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiry?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    resumeGenerationsLimit?: number;
  }): Promise<User | undefined>;

  // Resumes
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, updates: Partial<Resume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;

  // Role Recommendations
  getRoleRecommendationsByResumeId(resumeId: number): Promise<RoleRecommendation[]>;
  createRoleRecommendation(recommendation: InsertRoleRecommendation): Promise<RoleRecommendation>;
  deleteRoleRecommendationsByResumeId(resumeId: number): Promise<void>;

  // Tailored Resumes
  getTailoredResume(id: number): Promise<TailoredResume | undefined>;
  getTailoredResumesByResumeId(resumeId: number): Promise<TailoredResume[]>;
  createTailoredResume(tailoredResume: InsertTailoredResume): Promise<TailoredResume>;
  deleteTailoredResume(id: number): Promise<boolean>;

  // Activities
  getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

/**
 * Database-backed storage implementation using Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserSubscription(
    id: number,
    subscriptionData: {
      subscriptionStatus: SubscriptionStatus;
      subscriptionExpiry?: Date;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      resumeGenerationsLimit?: number;
    }
  ): Promise<User | undefined> {
    const subscriptionLimits: Record<SubscriptionStatus, number> = {
      free: 1,
      plus: 10,
      pro: 30,
    };

    const [updated] = await db
      .update(users)
      .set({
        subscriptionStatus: subscriptionData.subscriptionStatus,
        subscriptionExpiry: subscriptionData.subscriptionExpiry,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        resumeGenerationsLimit:
          subscriptionData.resumeGenerationsLimit ||
          subscriptionLimits[subscriptionData.subscriptionStatus],
        updatedAt: new Date(),
      })
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
    return db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const [resume] = await db.insert(resumes).values(insertResume).returning();
    return resume;
  }

  async updateResume(id: number, updates: Partial<Resume>): Promise<Resume | undefined> {
    const [updated] = await db
      .update(resumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }

  async deleteResume(id: number): Promise<boolean> {
    await db.delete(resumes).where(eq(resumes.id, id));
    return true;
  }

  // Role Recommendations
  async getRoleRecommendationsByResumeId(resumeId: number): Promise<RoleRecommendation[]> {
    return db
      .select()
      .from(roleRecommendations)
      .where(eq(roleRecommendations.resumeId, resumeId));
  }

  async createRoleRecommendation(recommendation: InsertRoleRecommendation): Promise<RoleRecommendation> {
    const [created] = await db
      .insert(roleRecommendations)
      .values(recommendation)
      .returning();
    return created;
  }

  async deleteRoleRecommendationsByResumeId(resumeId: number): Promise<void> {
    await db.delete(roleRecommendations).where(eq(roleRecommendations.resumeId, resumeId));
  }

  // Tailored Resumes
  async getTailoredResume(id: number): Promise<TailoredResume | undefined> {
    const [tailored] = await db
      .select()
      .from(tailoredResumes)
      .where(eq(tailoredResumes.id, id));
    return tailored;
  }

  async getTailoredResumesByResumeId(resumeId: number): Promise<TailoredResume[]> {
    return db
      .select()
      .from(tailoredResumes)
      .where(eq(tailoredResumes.originalResumeId, resumeId))
      .orderBy(desc(tailoredResumes.createdAt));
  }

  async createTailoredResume(insertTailored: InsertTailoredResume): Promise<TailoredResume> {
    const [created] = await db
      .insert(tailoredResumes)
      .values(insertTailored)
      .returning();
    return created;
  }

  async deleteTailoredResume(id: number): Promise<boolean> {
    await db.delete(tailoredResumes).where(eq(tailoredResumes.id, id));
    return true;
  }

  // Activities
  async getActivitiesByUserId(userId: number, limit = 20): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(insertActivity).returning();
    return created;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
