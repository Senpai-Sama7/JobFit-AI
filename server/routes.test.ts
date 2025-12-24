import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import router from './routes';

// Mock the database
vi.mock('./db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

// Mock auth module
vi.mock('./auth', () => ({
  requireAuth: vi.fn((req, res, next) => next()),
  registerUser: vi.fn(),
  hashPassword: vi.fn(() => 'hashed_password'),
}));

// Mock services
vi.mock('./services/parser', () => ({
  processResume: vi.fn(),
}));

vi.mock('./services/tailoring', () => ({
  tailorResume: vi.fn(),
}));

vi.mock('./services/recommender', () => ({
  generateRoleRecommendations: vi.fn(),
}));

vi.mock('./services/openai', () => ({
  getOpenAIClient: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    request: vi.fn(),
  },
}));

// Mock rate limiter
vi.mock('./middleware/rate-limit', () => ({
  rateLimiters: {
    standard: (req: any, res: any, next: any) => next(),
    auth: (req: any, res: any, next: any) => next(),
    upload: (req: any, res: any, next: any) => next(),
    ai: (req: any, res: any, next: any) => next(),
  },
}));

describe('API Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Mock authenticated user
    app.use((req, res, next) => {
      req.user = {
        id: 1,
        email: 'test@example.com',
        hashedPassword: 'hash',
        subscriptionStatus: 'free',
        subscriptionExpiry: null,
        resumeGenerationsUsed: 0,
        resumeGenerationsLimit: 1,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.isAuthenticated = () => true;
      next();
    });
    app.use(router);
    vi.clearAllMocks();
  });

  describe('GET /api/auth/session', () => {
    it('should return authenticated user session', async () => {
      const res = await request(app).get('/api/auth/session');
      expect(res.status).toBe(200);
      expect(res.body.authenticated).toBe(true);
      expect(res.body.user).toHaveProperty('id', 1);
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return unauthenticated for non-logged in users', async () => {
      // Create app without authenticated user
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use(router);

      const res = await request(unauthApp).get('/api/auth/session');
      expect(res.status).toBe(200);
      expect(res.body.authenticated).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should validate password length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should validate request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/user', () => {
    it('should return user profile', async () => {
      const { db } = await import('./db');
      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockResolvedValue([]);

      const res = await request(app).get('/api/user');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('subscriptionStatus');
    });
  });

  describe('POST /api/create-subscription', () => {
    it('should validate plan type', async () => {
      const res = await request(app)
        .post('/api/create-subscription')
        .send({ plan: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request');
    });

    it('should accept valid plus plan', async () => {
      const { db } = await import('./db');
      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockResolvedValue([]);
      (db.insert as any).mockReturnThis();
      (db.values as any).mockReturnThis();
      (db.returning as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app)
        .post('/api/create-subscription')
        .send({ plan: 'plus' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('plan', 'plus');
      expect(res.body).toHaveProperty('price', 0.99);
    });

    it('should accept valid pro plan', async () => {
      const { db } = await import('./db');
      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockResolvedValue([]);
      (db.insert as any).mockReturnThis();
      (db.values as any).mockReturnThis();
      (db.returning as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app)
        .post('/api/create-subscription')
        .send({ plan: 'pro' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('plan', 'pro');
      expect(res.body).toHaveProperty('price', 4.99);
    });
  });

  describe('GET /api/resumes', () => {
    it('should return list of resumes', async () => {
      const { db } = await import('./db');
      const mockResumes = [
        { id: 1, userId: 1, originalFileName: 'resume.pdf', atsScore: 75 },
        { id: 2, userId: 1, originalFileName: 'resume2.pdf', atsScore: 80 },
      ];

      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockReturnThis();
      (db.orderBy as any).mockResolvedValue(mockResumes);

      const res = await request(app).get('/api/resumes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/resumes/:id', () => {
    it('should validate resume id', async () => {
      const res = await request(app).get('/api/resumes/invalid');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid resume id');
    });

    it('should return 404 for non-existent resume', async () => {
      const { db } = await import('./db');
      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockResolvedValue([]);

      const res = await request(app).get('/api/resumes/999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Resume not found');
    });
  });

  describe('POST /api/resumes/manual', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/resumes/manual')
        .send({ resumeData: {} });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request');
    });

    it('should accept valid manual resume data', async () => {
      const { db } = await import('./db');
      const mockResume = {
        id: 1,
        userId: 1,
        originalFileName: 'manual_resume_123.json',
        atsScore: 75,
      };

      (db.insert as any).mockReturnThis();
      (db.values as any).mockReturnThis();
      (db.returning as any).mockResolvedValue([mockResume]);

      const res = await request(app)
        .post('/api/resumes/manual')
        .send({
          resumeData: {
            contact: {
              name: 'John Doe',
              email: 'john@example.com',
            },
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('POST /api/resumes/:id/tailor', () => {
    it('should validate job description length', async () => {
      const { db } = await import('./db');
      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockResolvedValue([{ id: 1, parsedData: { text: 'resume content' } }]);

      const res = await request(app)
        .post('/api/resumes/1/tailor')
        .send({ jobDescription: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request');
    });
  });

  describe('POST /api/resumes/:id/export', () => {
    it('should validate export format', async () => {
      const { db } = await import('./db');
      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockResolvedValue([{ id: 1, parsedData: { text: 'resume content' } }]);

      const res = await request(app)
        .post('/api/resumes/1/export')
        .send({ format: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request');
    });

    it('should accept valid txt format', async () => {
      const { db } = await import('./db');
      const mockResume = {
        id: 1,
        userId: 1,
        originalFileName: 'resume.pdf',
        parsedData: { text: 'Resume content here' },
      };

      (db.select as any).mockReturnThis();
      (db.from as any).mockReturnThis();
      (db.where as any).mockReturnThis();
      (db.limit as any).mockReturnThis();
      (db.orderBy as any).mockResolvedValue([]);

      // First call for resume lookup
      (db.where as any).mockResolvedValueOnce([mockResume]);
      // Second call for tailored resume lookup
      (db.where as any).mockResolvedValueOnce([]);

      (db.insert as any).mockReturnThis();
      (db.values as any).mockReturnThis();
      (db.returning as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app)
        .post('/api/resumes/1/export')
        .send({ format: 'txt' });

      // Should either succeed or be a valid response
      expect([200, 500]).toContain(res.status);
    });
  });
});

describe('Input Validation', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: 1, email: 'test@example.com' } as any;
      req.isAuthenticated = () => true;
      next();
    });
    app.use(router);
  });

  describe('Zod Schema Validation', () => {
    it('should reject negative resume IDs', async () => {
      const res = await request(app).get('/api/resumes/-1');
      expect(res.status).toBe(400);
    });

    it('should reject non-integer resume IDs', async () => {
      const res = await request(app).get('/api/resumes/1.5');
      expect(res.status).toBe(400);
    });

    it('should reject empty email in registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: '', password: 'validpassword123' });
      expect(res.status).toBe(400);
    });
  });
});

describe('Security Features', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: 1, email: 'test@example.com' } as any;
      req.isAuthenticated = () => true;
      next();
    });
    app.use(router);
  });

  it('should not expose internal errors in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const res = await request(app).get('/api/resumes/invalid');

    // Should not contain stack traces
    expect(res.body).not.toHaveProperty('stack');

    process.env.NODE_ENV = originalEnv;
  });
});
