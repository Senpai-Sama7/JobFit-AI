/**
 * JobFit-AI In-Memory Storage Implementation
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Provides a mock in-memory storage layer for users, resumes, recommendations, and activities.
 * - Replace with a persistent database implementation for production deployments.
 */
import { 
  users, resumes, roleRecommendations, tailoredResumes, activities,
  type User, type InsertUser, type Resume, type InsertResume,
  type RoleRecommendation, type InsertRoleRecommendation,
  type TailoredResume, type InsertTailoredResume,
  type Activity, type InsertActivity,
  type ParsedResume, type SkillProfile
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(id: number, subscriptionData: {
    subscriptionStatus: "free" | "plus" | "pro";
    subscriptionExpiry?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private roleRecommendations: Map<number, RoleRecommendation>;
  private tailoredResumes: Map<number, TailoredResume>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentResumeId: number;
  private currentRoleRecId: number;
  private currentTailoredId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.roleRecommendations = new Map();
    this.tailoredResumes = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentRoleRecId = 1;
    this.currentTailoredId = 1;
    this.currentActivityId = 1;

    // Create default user for demo
    this.createUser({ 
      username: "demo", 
      password: "demo123"
      // email intentionally omitted for InsertUser type compatibility
    });
  }



  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // InsertUser does not have email, so default to username@demo.com
    const user: User = { 
      ...insertUser, 
      id,
      email: `${insertUser.username}@demo.com`,
      subscriptionStatus: "free",
      resumeGenerationsUsed: 0,
      resumeGenerationsLimit: 1,
      subscriptionExpiry: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSubscription(id: number, subscriptionData: {
    subscriptionStatus: "free" | "plus" | "pro";
    subscriptionExpiry?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    // Match User type: free, plus, pro
    const subscriptionLimits: Record<"free" | "plus" | "pro", number> = {
      free: 1,
      plus: 10,
      pro: 30
    };

    const updatedUser: User = {
      ...user,
      ...subscriptionData,
      resumeGenerationsLimit: subscriptionLimits[subscriptionData.subscriptionStatus],
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Resumes
  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(resume => resume.userId === userId);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const now = new Date();
    const resume: Resume = {
      ...insertResume,
      id,
      originalFileName: insertResume.originalFileName || null,
      parsedData: null,
      skillProfile: null,
      atsScore: null,
      processingStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: number, updates: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;

    const updatedResume: Resume = {
      ...resume,
      ...updates,
      updatedAt: new Date(),
    };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.resumes.delete(id);
  }

  // Role Recommendations
  async getRoleRecommendationsByResumeId(resumeId: number): Promise<RoleRecommendation[]> {
    return Array.from(this.roleRecommendations.values())
      .filter(rec => rec.resumeId === resumeId)
      .sort((a, b) => b.fitScore - a.fitScore);
  }

  async createRoleRecommendation(recommendation: InsertRoleRecommendation): Promise<RoleRecommendation> {
    const id = this.currentRoleRecId++;
    const roleRec: RoleRecommendation = { ...recommendation, id };
    this.roleRecommendations.set(id, roleRec);
    return roleRec;
  }

  async deleteRoleRecommendationsByResumeId(resumeId: number): Promise<void> {
    const toDelete = Array.from(this.roleRecommendations.entries())
      .filter(([_, rec]) => rec.resumeId === resumeId)
      .map(([id, _]) => id);
    
    toDelete.forEach(id => this.roleRecommendations.delete(id));
  }

  // Tailored Resumes
  async getTailoredResume(id: number): Promise<TailoredResume | undefined> {
    return this.tailoredResumes.get(id);
  }

  async getTailoredResumesByResumeId(resumeId: number): Promise<TailoredResume[]> {
    return Array.from(this.tailoredResumes.values())
      .filter(tailored => tailored.originalResumeId === resumeId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTailoredResume(insertTailoredResume: InsertTailoredResume): Promise<TailoredResume> {
    const id = this.currentTailoredId++;
    const tailoredResume: TailoredResume = {
      id,
      originalResumeId: insertTailoredResume.originalResumeId,
      jobDescription: insertTailoredResume.jobDescription,
      tailoredContent: insertTailoredResume.tailoredContent as ParsedResume | null,
      improvements: insertTailoredResume.improvements as any,
      atsScore: insertTailoredResume.atsScore ?? null,
      createdAt: new Date(),
    };
    this.tailoredResumes.set(id, tailoredResume);
    return tailoredResume;
  }

  async deleteTailoredResume(id: number): Promise<boolean> {
    return this.tailoredResumes.delete(id);
  }

  // Activities
  async getActivitiesByUserId(userId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      description: insertActivity.description || null,
      metadata: insertActivity.metadata || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

// Use persistent PostgreSQL storage in production
import { PgStorage } from './pg-storage';
export const storage = new PgStorage();
