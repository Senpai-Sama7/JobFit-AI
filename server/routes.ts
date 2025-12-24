import { Router, type Request, type Response, type NextFunction } from 'express';
import passport from 'passport';
import multer from 'multer';
import { z } from 'zod';
import { db } from './db';
import {
  users,
  resumes,
  roleRecommendations,
  tailoredResumes,
  activities,
  type SkillProfile,
  type Resume,
  type User,
  type Activity,
} from '../shared/schema';
import { processResume } from './services/parser';
import { tailorResume } from './services/tailoring';
import { generateRoleRecommendations } from './services/recommender';
import { getOpenAIClient } from './services/openai';
import { requireAuth, registerUser, hashPassword } from './auth';
import { eq, desc, and, count, inArray } from 'drizzle-orm';

const router = Router();

// ========================
// SECURITY UTILITIES
// ========================

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Only allow safe characters
    .replace(/\.+/g, '.')              // Prevent multiple dots
    .substring(0, 255);                // Limit length
}

/**
 * Escape content for CSV to prevent formula injection
 */
function escapeCSVContent(content: string): string {
  return content
    .replace(/"/g, '""')               // Escape double quotes
    .replace(/\n/g, ' ')               // Replace newlines
    .replace(/^[=+@-]/, "'$&");        // Prefix dangerous formula chars
}

// File upload configuration with validation
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) ||
        file.originalname.match(/\.(pdf|docx|txt|md|rtf|odt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOCX, TXT, MD, RTF, ODT'));
    }
  },
});

// Validation schemas
const idSchema = z.coerce.number().int().positive();
const tailorSchema = z.object({ jobDescription: z.string().min(10, 'Job description must be at least 10 characters') });
const exportSchema = z.object({ format: z.enum(['txt', 'csv', 'json']) });
const subscriptionSchema = z.object({ plan: z.enum(['plus', 'pro']) });
const manualResumeSchema = z.object({
  resumeData: z.object({
    contact: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      location: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    }),
    summary: z.string().optional(),
    experience: z.array(z.object({
      role: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      bullets: z.array(z.string()).optional(),
    })).optional(),
    education: z.array(z.object({
      degree: z.string(),
      institution: z.string(),
      graduationDate: z.string().optional(),
      gpa: z.string().optional(),
    })).optional(),
    skills: z.array(z.string()).optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().optional(),
    })).optional(),
  }),
});

// Validation schemas for auth
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Helper: Get current user from session or demo mode
async function getCurrentUser(req: Request): Promise<User> {
  // If user is authenticated via session, use that
  if (req.user) {
    return req.user as User;
  }

  // Fallback to demo mode for development/testing
  const [existingUser] = await db.select().from(users).limit(1);
  if (existingUser) return existingUser;

  // Create demo user if none exists
  const [newUser] = await db.insert(users).values({
    email: 'demo@jobfit.ai',
    hashedPassword: hashPassword('demo-password'),
  }).returning();

  return newUser;
}

// Helper: Wrap handler with resume lookup
async function withResume(
  req: Request,
  res: Response,
  handler: (resume: Resume, resumeId: number) => Promise<void>,
): Promise<void> {
  const idResult = idSchema.safeParse(req.params.id);
  if (!idResult.success) {
    res.status(400).json({ error: 'Invalid resume id', details: idResult.error.format() });
    return;
  }
  const resumeId = idResult.data;
  const [resume] = await db.select().from(resumes).where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.userId!)));
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }
  await handler(resume, resumeId);
}

// Helper: Log activity
async function logActivity(userId: number, type: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<void> {
  await db.insert(activities).values({
    userId,
    type,
    title,
    description: description || null,
    metadata: metadata || null,
  });
}

// ========================
// AUTHENTICATION ROUTES
// ========================

// POST /api/auth/register - Register a new user
router.post('/api/auth/register', async (req: Request, res: Response) => {
  const body = registerSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Validation failed', details: body.error.format() });
  }

  try {
    const { email, password } = body.data;
    const result = await registerUser(email, password);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Auto-login after registration
    req.login(result.user, (err) => {
      if (err) {
        console.error('Auto-login after registration failed:', err);
        return res.status(201).json({
          message: 'Registration successful. Please log in.',
          user: { id: result.user.id, email: result.user.email },
        });
      }

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          subscriptionStatus: result.user.subscriptionStatus,
        },
      });
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}));

// POST /api/auth/login - Login user
router.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Validation failed', details: body.error.format() });
  }

  passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string }) => {
    if (err) {
      console.error('Login Error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Session creation failed:', loginErr);
        return res.status(500).json({ error: 'Login failed' });
      }

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
        },
      });
    });
  })(req, res, next);
});

// POST /api/auth/logout - Logout user
router.post('/api/auth/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Session destroy failed:', sessionErr);
      }
      res.clearCookie('jobfit.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
}));

// GET /api/auth/session - Check if user is logged in
router.get('/api/auth/session', (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        subscriptionStatus: req.user.subscriptionStatus,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ========================
// USER ROUTES
// ========================

// GET /api/user - Get current user profile
router.get('/api/user', async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req);

    // Get user stats
    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, user.id));

    res.json({
      id: user.id,
      email: user.email,
      username: user.email.split('@')[0],
      subscriptionStatus: (user as any).subscriptionStatus || 'free',
      subscriptionExpiry: (user as any).subscriptionExpiry || null,
      resumeGenerationsUsed: userResumes.length,
      resumeGenerationsLimit: ((user as any).subscriptionStatus === 'pro' ? 30 :
                              (user as any).subscriptionStatus === 'plus' ? 10 : 1),
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// POST /api/create-subscription - Create subscription (demo mode)
router.post('/api/create-subscription', async (req: Request, res: Response) => {
  const body = subscriptionSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Invalid request', details: body.error.format() });
  }

  try {
    const user = await getCurrentUser(req);
    const { plan } = body.data;

    const pricing = {
      plus: { price: 0.99, limit: 10 },
      pro: { price: 4.99, limit: 30 },
    };

    // In demo mode, we just return a mock checkout URL
    // In production, this would integrate with Stripe
    const checkoutUrl = `https://checkout.stripe.com/demo/${plan}/${user.id}`;

    await logActivity(user.id, 'subscription', `Subscription initiated: ${plan}`,
      `User initiated ${plan} plan subscription at $${pricing[plan].price}/month`);

    res.json({
      url: checkoutUrl,
      plan,
      price: pricing[plan].price,
      message: 'Demo subscription created. In production, this would redirect to Stripe checkout.',
    });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// ========================
// DASHBOARD ROUTES
// ========================

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req);

    // Get all resumes for this user
    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, user.id));

    // Calculate average ATS score
    const scoresOnly = userResumes.filter(r => r.atsScore !== null).map(r => r.atsScore as number);
    const averageAtsScore = scoresOnly.length > 0
      ? Math.round(scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length)
      : 0;

    // Get role recommendations count
    const resumeIds = userResumes.map(r => r.id);
    let roleMatches = 0;
    if (resumeIds.length > 0) {
      const [recCount] = await db
        .select({ count: count() })
        .from(roleRecommendations)
        .where(inArray(roleRecommendations.resumeId, resumeIds));
      roleMatches = recCount?.count || 0;
    }

    // Get tailored resumes count
    let tailoredCount = 0;
    if (resumeIds.length > 0) {
      const [tailored] = await db
        .select({ count: count() })
        .from(tailoredResumes)
        .where(inArray(tailoredResumes.originalResumeId, resumeIds));
      tailoredCount = tailored?.count || 0;
    }

    // Get export count from activities
    const [exportCount] = await db
      .select({ count: count() })
      .from(activities)
      .where(and(eq(activities.userId, user.id), eq(activities.type, 'exported')));

    res.json({
      resumesCreated: userResumes.length,
      averageAtsScore,
      roleMatches,
      tailoredResumes: tailoredCount,
      exports: exportCount?.count || 0,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// GET /api/activities - Get user activities
router.get('/api/activities', async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req);

    const userActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, user.id))
      .orderBy(desc(activities.createdAt))
      .limit(20);

    res.json(userActivities);
  } catch (error) {
    console.error('Activities Error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// ========================
// RESUME ROUTES
// ========================

// GET /api/resumes - List all resumes for current user
router.get('/api/resumes', async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req);

    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, user.id))
      .orderBy(desc(resumes.createdAt));

    res.json(userResumes);
  } catch (error) {
    console.error('List Resumes Error:', error);
    res.status(500).json({ error: 'Failed to list resumes' });
  }
});

// GET /api/resumes/:id - Get single resume
router.get('/api/resumes/:id', async (req: Request, res: Response) => {
  await withResume(req, res, async (resume) => {
    // Also fetch any tailored versions
    const tailored = await db
      .select()
      .from(tailoredResumes)
      .where(eq(tailoredResumes.originalResumeId, resume.id))
      .orderBy(desc(tailoredResumes.createdAt));

    // Fetch recommendations
    const recommendations = await db
      .select()
      .from(roleRecommendations)
      .where(eq(roleRecommendations.resumeId, resume.id));

    res.json({
      ...resume,
      tailoredVersions: tailored,
      recommendations,
    });
  });
});

// POST /api/resumes/upload - Upload and process a resume file
router.post('/api/resumes/upload', upload.single('resume'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume file provided' });
  }

  try {
    const user = await getCurrentUser(req);
    // Sanitize filename to prevent path traversal and injection attacks
    const safeFilename = sanitizeFilename(req.file.originalname);
    const simulatedS3Key = `resumes/${user.id}/${Date.now()}-${safeFilename}`;

    const [newResume] = await db
      .insert(resumes)
      .values({
        userId: user.id,
        originalFileName: safeFilename,
        s3Key: simulatedS3Key,
        processingStatus: 'processing',
      })
      .returning();

    // Process asynchronously
    processResume(newResume.id, req.file.buffer, safeFilename);

    // Log activity
    await logActivity(user.id, 'upload', 'Resume Uploaded',
      `Uploaded ${safeFilename} for processing`);

    res.status(202).json({
      message: 'Resume upload accepted. Processing in background.',
      resumeId: newResume.id,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process resume upload' });
  }
});

// POST /api/resumes/manual - Create resume manually
router.post('/api/resumes/manual', async (req: Request, res: Response) => {
  const body = manualResumeSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Invalid request', details: body.error.format() });
  }

  try {
    const user = await getCurrentUser(req);
    const { resumeData } = body.data;

    // Build skills array from various sources
    const skills: string[] = resumeData.skills || [];

    // Create skill profile
    const skillProfile: SkillProfile = { skills };

    // Build text representation for parsing
    const textParts: string[] = [];
    textParts.push(`${resumeData.contact.name}`);
    textParts.push(`Email: ${resumeData.contact.email}`);
    if (resumeData.contact.phone) textParts.push(`Phone: ${resumeData.contact.phone}`);
    if (resumeData.contact.location) textParts.push(`Location: ${resumeData.contact.location}`);
    if (resumeData.summary) textParts.push(`\nPROFESSIONAL SUMMARY\n${resumeData.summary}`);

    if (resumeData.experience?.length) {
      textParts.push('\nPROFESSIONAL EXPERIENCE');
      resumeData.experience.forEach(exp => {
        textParts.push(`${exp.role} | ${exp.company} | ${exp.startDate} - ${exp.endDate || 'Present'}`);
        if (exp.description) textParts.push(exp.description);
        exp.bullets?.forEach(b => textParts.push(`• ${b}`));
      });
    }

    if (resumeData.education?.length) {
      textParts.push('\nEDUCATION');
      resumeData.education.forEach(edu => {
        textParts.push(`${edu.degree} - ${edu.institution}${edu.graduationDate ? ` (${edu.graduationDate})` : ''}`);
      });
    }

    if (skills.length) {
      textParts.push(`\nSKILLS\n${skills.join(', ')}`);
    }

    const text = textParts.join('\n');

    // Calculate initial ATS score based on completeness
    let atsScore = 50; // Base score
    if (resumeData.contact.name && resumeData.contact.email) atsScore += 10;
    if (resumeData.summary && resumeData.summary.length > 50) atsScore += 10;
    if (resumeData.experience?.length) atsScore += 15;
    if (resumeData.education?.length) atsScore += 5;
    if (skills.length >= 5) atsScore += 10;
    atsScore = Math.min(atsScore, 90); // Cap at 90 for manual entry

    const [newResume] = await db
      .insert(resumes)
      .values({
        userId: user.id,
        originalFileName: `manual_resume_${Date.now()}.json`,
        s3Key: `manual/${user.id}/${Date.now()}.json`,
        parsedData: { ...resumeData, text },
        skillProfile,
        atsScore,
        processingStatus: 'processed',
      })
      .returning();

    await logActivity(user.id, 'created', 'Resume Created',
      `Created resume manually with ATS score: ${atsScore}%`);

    res.status(201).json(newResume);
  } catch (error) {
    console.error('Manual Resume Error:', error);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// GET /api/resumes/:id/status - Check processing status
router.get('/api/resumes/:id/status', (req: Request, res: Response) =>
  withResume(req, res, async (resume) => {
    res.json({
      status: resume.processingStatus,
      atsScore: resume.atsScore,
      updatedAt: resume.updatedAt,
    });
  })
);

// DELETE /api/resumes/:id - Delete a resume
router.delete('/api/resumes/:id', async (req: Request, res: Response) => {
  await withResume(req, res, async (resume, resumeId) => {
    try {
      const user = await getCurrentUser(req);

      // Delete related records first
      await db.delete(roleRecommendations).where(eq(roleRecommendations.resumeId, resumeId));
      await db.delete(tailoredResumes).where(eq(tailoredResumes.originalResumeId, resumeId));

      // Delete the resume
      await db.delete(resumes).where(eq(resumes.id, resumeId));

      await logActivity(user.id, 'deleted', 'Resume Deleted',
        `Deleted resume: ${resume.originalFileName}`);

      res.json({ success: true, message: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Delete Resume Error:', error);
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  });
});

// ========================
// RESUME AI OPERATIONS
// ========================

// POST /api/resumes/:id/optimize - Optimize resume for ATS
router.post('/api/resumes/:id/optimize', (req: Request, res: Response) =>
  withResume(req, res, async (resume, resumeId) => {
    try {
      const user = await getCurrentUser(req);
      const originalScore = resume.atsScore || 0;
      const parsedData = resume.parsedData as Record<string, unknown> | null;
      const text = (parsedData?.text as string) || '';

      if (!text) {
        res.status(400).json({ error: 'Resume has no content to optimize' });
        return;
      }

      const openai = getOpenAIClient();
      const prompt = `You are an expert resume optimizer. Analyze the following resume and provide:
1. An improved ATS (Applicant Tracking System) score from 0-100
2. A list of specific, actionable improvements

Respond ONLY with valid JSON in this exact format:
{
  "newScore": <number between 0-100>,
  "improvements": [
    "<specific improvement 1>",
    "<specific improvement 2>",
    ...
  ]
}

Resume:
"""
${text}
"""`;

      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const reply = aiResponse.choices[0]?.message?.content || '';
      let newScore = originalScore;
      let improvements: string[] = [];

      try {
        const parsed = JSON.parse(reply);
        newScore = Math.min(100, Math.max(0, Number(parsed.newScore) || originalScore));
        if (Array.isArray(parsed.improvements)) {
          improvements = parsed.improvements.map(String).filter(Boolean);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response for optimization:', parseError);
        // Fallback improvements if parsing fails
        improvements = [
          'Add more quantifiable achievements with metrics',
          'Include industry-specific keywords',
          'Ensure consistent formatting throughout',
          'Add a compelling professional summary',
          'Use action verbs to start bullet points',
        ];
        newScore = Math.min(originalScore + 10, 85);
      }

      await db.update(resumes)
        .set({ atsScore: newScore, updatedAt: new Date() })
        .where(eq(resumes.id, resumeId));

      await logActivity(user.id, 'optimized', 'Resume Optimized',
        `ATS score improved from ${originalScore}% to ${newScore}%`);

      res.json({
        oldScore: originalScore,
        newScore,
        improvements,
        message: newScore > originalScore
          ? `Your ATS score improved by ${newScore - originalScore} points!`
          : 'Resume analyzed. Apply the suggestions to improve your score.',
      });
    } catch (error) {
      console.error('Optimize Error:', error);
      res.status(500).json({ error: 'Failed to optimize resume' });
    }
  })
);

// POST /api/resumes/:id/tailor - Tailor resume to job description
router.post('/api/resumes/:id/tailor', async (req: Request, res: Response) => {
  const body = tailorSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Invalid request', details: body.error.format() });
  }

  const { jobDescription } = body.data;

  await withResume(req, res, async (resume, resumeId) => {
    try {
      const user = await getCurrentUser(req);
      const parsedData = resume.parsedData as Record<string, unknown> | null;
      const text = (parsedData?.text as string) || '';

      if (!text) {
        res.status(400).json({ error: 'Resume has no content to tailor' });
        return;
      }

      const tailored = await tailorResume(text, jobDescription);

      const [saved] = await db
        .insert(tailoredResumes)
        .values({
          originalResumeId: resumeId,
          jobDescription,
          tailoredContent: tailored.tailoredContent,
          improvements: tailored.improvements,
          atsScore: tailored.atsScore,
        })
        .returning();

      await logActivity(user.id, 'tailored', 'Resume Tailored',
        `Tailored resume for specific job posting. New ATS score: ${tailored.atsScore}%`);

      res.json(saved);
    } catch (error) {
      console.error('Tailor Error:', error);
      res.status(500).json({ error: 'Failed to tailor resume' });
    }
  });
});

// GET /api/resumes/:id/recommendations - Get role recommendations
router.get('/api/resumes/:id/recommendations', (req: Request, res: Response) =>
  withResume(req, res, async (resume, resumeId) => {
    try {
      const user = await getCurrentUser(req);
      const skillProfile = resume.skillProfile as SkillProfile | null;

      if (!skillProfile || !skillProfile.skills?.length) {
        res.status(400).json({ error: 'Resume lacks skill profile. Please process the resume first.' });
        return;
      }

      // Check for existing recommendations
      const existing = await db
        .select()
        .from(roleRecommendations)
        .where(eq(roleRecommendations.resumeId, resumeId));

      if (existing.length > 0) {
        // Return existing recommendations
        res.json(existing.map(rec => ({
          id: rec.id,
          jobTitle: rec.jobTitle,
          title: rec.jobTitle, // Alias for frontend compatibility
          companyName: rec.companyName,
          fitScore: rec.fitScore,
          description: rec.description,
          source: rec.source,
          requiredSkills: skillProfile.skills.slice(0, 5), // Add skills for display
        })));
        return;
      }

      // Generate new recommendations
      const recommendations = await generateRoleRecommendations(skillProfile);

      // Save to database
      const savedRecs = await Promise.all(
        recommendations.map(async (r) => {
          const [saved] = await db
            .insert(roleRecommendations)
            .values({ ...r, resumeId })
            .returning();
          return saved;
        })
      );

      await logActivity(user.id, 'recommendations', 'Role Recommendations Generated',
        `Found ${recommendations.length} matching roles for your profile`);

      res.json(savedRecs.map(rec => ({
        id: rec.id,
        jobTitle: rec.jobTitle,
        title: rec.jobTitle, // Alias for frontend compatibility
        companyName: rec.companyName,
        fitScore: rec.fitScore,
        description: rec.description,
        source: rec.source,
        requiredSkills: skillProfile.skills.slice(0, 5),
      })));
    } catch (error) {
      console.error('Recommendations Error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  })
);

// POST /api/resumes/:id/export - Export resume
router.post('/api/resumes/:id/export', async (req: Request, res: Response) => {
  const body = exportSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Invalid request', details: body.error.format() });
  }

  const { format } = body.data;

  await withResume(req, res, async (resume, resumeId) => {
    try {
      const user = await getCurrentUser(req);
      const parsedData = resume.parsedData as Record<string, unknown> | null;
      let content = (parsedData?.text as string) || '';

      // Check for tailored version
      const [tailored] = await db
        .select()
        .from(tailoredResumes)
        .where(eq(tailoredResumes.originalResumeId, resumeId))
        .orderBy(desc(tailoredResumes.createdAt))
        .limit(1);

      if (tailored?.tailoredContent) {
        content = typeof tailored.tailoredContent === 'string'
          ? tailored.tailoredContent
          : JSON.stringify(tailored.tailoredContent, null, 2);
      }

      await logActivity(user.id, 'exported', 'Resume Exported',
        `Exported resume as ${format.toUpperCase()}`);

      // Sanitize filename for safe Content-Disposition header
      const baseFilename = resume.originalFileName?.replace(/\.[^/.]+$/, '') || 'resume';
      const safeFilename = sanitizeFilename(baseFilename);
      const encodedFilename = encodeURIComponent(safeFilename);

      switch (format) {
        case 'txt':
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Content-Disposition',
            `attachment; filename="${safeFilename}.txt"; filename*=UTF-8''${encodedFilename}.txt`);
          res.send(content);
          break;

        case 'csv':
          // Use escapeCSVContent to prevent formula injection
          const csvContent = `"Section","Content"\n"Full Resume","${escapeCSVContent(content)}"`;
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Content-Disposition',
            `attachment; filename="${safeFilename}.csv"; filename*=UTF-8''${encodedFilename}.csv`);
          res.send(csvContent);
          break;

        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition',
            `attachment; filename="${safeFilename}.json"; filename*=UTF-8''${encodedFilename}.json`);
          res.json({
            resume: parsedData,
            tailored: tailored?.tailoredContent || null,
            atsScore: tailored?.atsScore || resume.atsScore,
            exportedAt: new Date().toISOString(),
          });
          break;

        default:
          res.status(400).json({ error: 'Unsupported export format' });
      }
    } catch (error) {
      console.error('Export Error:', error);
      res.status(500).json({ error: 'Failed to export resume' });
    }
  });
});

export default router;
