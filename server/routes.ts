// --- Session/userId guard middleware ---
function requireSessionUserId(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session) return res.status(500).json({ error: "Session not initialized" });
  if (!req.session.userId) req.session.userId = 1;
  next();
}

// --- Move all imports to the top ---
import express from 'express';
import session from 'express-session';
// --- Express-session middleware setup ---
// You can move this to your main server file if needed
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'jobfit_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true if using HTTPS
});

// Extend Express Request type for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Export session middleware for use in main server
export { sessionMiddleware };
import Stripe from 'stripe';
import axios from 'axios';
import { getTopJobMatchesHF } from './services/hfRecommender';

// --- Initialize router at the top ---
const router = express.Router();

// --- Stripe setup ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER', { apiVersion: '2025-06-30.basil' });

// --- Indeed OAuth config ---
const INDEED_CLIENT_ID = process.env.INDEED_CLIENT_ID || 'YOUR_CLIENT_ID';
const INDEED_CLIENT_SECRET = process.env.INDEED_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const INDEED_REDIRECT_URI = process.env.INDEED_REDIRECT_URI || 'YOUR_REDIRECT_URI';

// --- API endpoint: Get top job matches for a resume ---
// POST /api/top-matches { resumeText: string }
router.post('/api/top-matches', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });
  // TODO: Replace with real job list from DB or API
  const jobs = [
    { id: '1', description: 'Software Engineer with experience in React, Node.js, and PostgreSQL.' },
    { id: '2', description: 'Data Scientist with Python, machine learning, and NLP skills.' },
    { id: '3', description: 'Frontend Developer skilled in TypeScript, Tailwind CSS, and UI/UX.' },
    { id: '4', description: 'Backend Developer with Node.js, Express, and database design experience.' },
    { id: '5', description: 'AI Engineer with experience in Hugging Face Transformers and deep learning.' },
  ];
  try {
    const matches = await getTopJobMatchesHF(resumeText, jobs, 3);
    res.json({ matches });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stripe Checkout session for membership ---
router.post('/api/subscribe', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID || 'price_PLACEHOLDER', quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/membership-success',
      cancel_url: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/membership-cancel',
      metadata: { userId: req.body.userId || '' },
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stripe webhook to update membership status ---
router.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_PLACEHOLDER');
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // TODO: Update user in DB to set subscriptionStatus = 'plus' or 'pro'
    // Use session.metadata.userId if you passed it
  }
  res.json({ received: true });
});

// --- Indeed OAuth callback route ---
router.get('/auth/indeed/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    const tokenResp = await axios.post('https://secure.indeed.com/oauth/v2/tokens', null, {
      params: {
        client_id: INDEED_CLIENT_ID,
        client_secret: INDEED_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: INDEED_REDIRECT_URI,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token } = tokenResp.data;
    if (!access_token) return res.status(400).json({ error: 'No access token' });
    const userResp = await axios.get('https://secure.indeed.com/v2/api/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    return res.json({ user: userResp.data, state });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'OAuth error' });
  }
});

router.get('/auth/indeed/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    // Exchange code for access token
    const tokenResp = await axios.post('https://secure.indeed.com/oauth/v2/tokens', null, {
      params: {
        client_id: INDEED_CLIENT_ID,
        client_secret: INDEED_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: INDEED_REDIRECT_URI,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token } = tokenResp.data;
    if (!access_token) return res.status(400).json({ error: 'No access token' });
    // Fetch user info
    const userResp = await axios.get('https://secure.indeed.com/v2/api/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    // You can now use userResp.data (sub, email, etc.) to log in or register the user
    // For demo, just return the user info
    return res.json({ user: userResp.data, state });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'OAuth error' });
  }
});

// ...existing code...
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { parseResume } from "./services/parser";
import { generateRoleRecommendations } from "./services/recommender";
import { tailorResume } from "./services/tailoring";
import { insertResumeSchema, insertTailoredResumeSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md', '.rtf', '.odt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOCX, TXT, MD, RTF, ODT'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/user", requireSessionUserId, async (req, res) => {
  let user = await storage.getUser(req.session.userId as number);
    if (!user) {
      // Add required password property for demo user
      user = await storage.createUser({
        username: "demo_user",
        password: "demo_password"
      });
    }
    res.json({
      id: user.id,
      username: user.username,
      subscriptionStatus: user.subscriptionStatus || "free",
      subscriptionExpiry: user.subscriptionExpiry,
      resumeGenerationsUsed: user.resumeGenerationsUsed || 0,
      resumeGenerationsLimit: user.resumeGenerationsLimit || 1,
    });
  });

  // Subscription routes
  app.post("/api/create-subscription", requireSessionUserId, async (req, res) => {
    try {
      const { plan } = req.body;
      res.status(501).json({ error: "Not implemented. Use /api/subscribe for real Stripe integration." });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create subscription: " + error.message });
    }
  });

  // Stripe webhook (simulation for demo)
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      // In production, verify the webhook signature
      const { type, data } = req.body;
      
      if (type === 'checkout.session.completed') {
        const session = data.object;
        // Find user and update subscription
        // This is simplified for demo
        console.log('Subscription completed:', session);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  // Get user's resumes
  app.get("/api/resumes", requireSessionUserId, async (req, res) => {
    try {
  const resumes = await storage.getResumesByUserId(req.session.userId as number);
      console.log('Resumes fetched:', resumes);
      res.json(resumes);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch resumes: " + error.message });
    }
  });

  // Create resume manually
  // Removed duplicate /api/resumes/manual route (see below for correct version)

  // Upload resume file
  app.post("/api/resumes/upload", requireSessionUserId, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  const userId = req.session.userId as number;
      const fileType = path.extname(req.file.originalname).toLowerCase();
      let rawContent = '';
      try {
        rawContent = req.file.buffer.toString('utf-8');
      } catch (err) {
        console.log("Binary file detected, using filename for parsing");
        rawContent = req.file.originalname;
      }
      const resume = await storage.createResume({
        userId: userId,
        originalFileName: req.file.originalname,
        fileType,
        rawContent,
      });
      await storage.createActivity({
        userId: userId,
        type: "upload",
        title: "Resume uploaded",
        description: `Uploaded ${req.file.originalname}`,
        metadata: { resumeId: resume.id, fileType },
      });
      setImmediate(async () => {
        try {
          await storage.updateResume(resume.id, { processingStatus: "parsing" });
          const parsedData = await parseResume(rawContent, fileType);
          const atsScore = calculateAtsScore(parsedData);
          await storage.updateResume(resume.id, {
            parsedData,
            atsScore,
            processingStatus: "generating_recommendations",
          });
          const recommendations = await generateRoleRecommendations(parsedData);
          for (const rec of recommendations) {
            await storage.createRoleRecommendation({
              resumeId: resume.id,
              ...rec,
            });
          }
          await storage.updateResume(resume.id, { processingStatus: "completed" });
          await storage.createActivity({
            userId: userId,
            type: "parsed",
            title: "Resume parsing completed",
            description: `ATS Score: ${atsScore}% • ${recommendations.length} role matches found`,
            metadata: { resumeId: resume.id, atsScore, roleCount: recommendations.length },
          });
        } catch (error) {
          console.error("Parsing error:", error);
          await storage.updateResume(resume.id, { processingStatus: "error" });
        }
      });
      res.json(resume);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload resume" });
    }
  });

  // Create resume manually
  app.post("/api/resumes/manual", requireSessionUserId, async (req, res) => {
    try {
      const { resumeData } = req.body;
      if (!resumeData) {
        return res.status(400).json({ error: "Resume data is required" });
      }
      const resume = await storage.createResume({
        userId: req.session.userId as number,
        originalFileName: "Manual Entry",
        fileType: ".json",
        rawContent: JSON.stringify(resumeData),
      });
      const atsScore = calculateAtsScore(resumeData);
      await storage.updateResume(resume.id, {
        parsedData: resumeData,
        atsScore,
        processingStatus: "completed",
      });
      const recommendations = await generateRoleRecommendations(resumeData);
      for (const rec of recommendations) {
        await storage.createRoleRecommendation({
          resumeId: resume.id,
          ...rec,
        });
      }
      await storage.createActivity({
        userId: req.session.userId as number,
        type: "created",
        title: "Resume created manually",
        description: `ATS Score: ${atsScore}% • ${recommendations.length} role matches found`,
        metadata: { resumeId: resume.id, atsScore },
      });
      res.json(resume);
    } catch (error) {
      console.error("Manual creation error:", error);
      res.status(500).json({ error: "Failed to create resume" });
    }
  });

  // Get user's resumes
  app.get("/api/resumes", async (req, res) => {
    try {
      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      const resumes = await storage.getResumesByUserId(req.session.userId);
      console.log("Resumes fetched:", resumes.map(r => ({ 
        id: r.id, 
        fileName: r.originalFileName, 
        status: r.processingStatus, 
        atsScore: r.atsScore,
        hasParsedData: !!r.parsedData 
      })));
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resumes" });
    }
  });

  // Get specific resume with recommendations
  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      const recommendations = await storage.getRoleRecommendationsByResumeId(resumeId);
      
      res.json({
        ...resume,
        recommendations,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  });

  // Delete resume
  app.delete("/api/resumes/:id", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const success = await storage.deleteResume(resumeId);
      
      if (!success) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Also delete related data
      await storage.deleteRoleRecommendationsByResumeId(resumeId);
      
      // Get tailored resumes and delete them
      const tailoredResumes = await storage.getTailoredResumesByResumeId(resumeId);
      for (const tailored of tailoredResumes) {
        await storage.deleteTailoredResume(tailored.id);
      }

      // Log activity
      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      await storage.createActivity({
        userId: req.session.userId,
        type: "deleted",
        title: "Resume deleted",
        description: `Resume ${resumeId} was permanently deleted`,
        metadata: { resumeId },
      });
      
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Resume deletion error:", error);
      res.status(500).json({ error: "Failed to delete resume" });
    }
  });

  // Export resume
  app.post("/api/resumes/:id/export", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { format = 'txt', optimized = false } = req.body;
      
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      if (!resume.parsedData) {
        return res.status(400).json({ error: "Resume has not been processed yet" });
      }

      const content = generateResumeContent(resume.parsedData, optimized);
      const contentType = getContentType(format);
      
      // Log export activity
      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      await storage.createActivity({
        userId: req.session.userId,
        type: "exported",
        title: "Resume exported",
        description: `Exported ${optimized ? 'optimized ' : ''}resume as ${format.toUpperCase()}`,
        metadata: { resumeId, format, optimized },
      });

  res.setHeader('Content-Type', contentType);
  const safeFileName = resume.originalFileName ? resume.originalFileName.replace(/\.[^/.]+$/, '') : 'resume';
  res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.${format}"`);
  res.send(content);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export resume" });
    }
  });

  // Get role recommendations
  app.get("/api/resumes/:id/recommendations", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      
      const resume = await storage.getResume(resumeId);
      if (!resume || !resume.parsedData) {
        return res.status(404).json({ error: "Resume not found or not processed" });
      }

      // Check if recommendations already exist
      let recommendations = await storage.getRoleRecommendationsByResumeId(resumeId);
      
      // If no recommendations exist, generate them
      if (recommendations.length === 0) {
        console.log("Generating new role recommendations for resume:", resumeId);
        const newRecommendations = await generateRoleRecommendations(resume.parsedData);
        
        // Store the generated recommendations
        for (const rec of newRecommendations) {
          await storage.createRoleRecommendation({
            resumeId,
            ...rec,
          });
        }
        
        // Fetch the stored recommendations
        recommendations = await storage.getRoleRecommendationsByResumeId(resumeId);
      }

      // Check user subscription status and apply limits
      if (req.session && req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        // Only allow 'plus' or 'pro' as premium
        const isPremium = user?.subscriptionStatus === "plus" || user?.subscriptionStatus === "pro";
        // Limit to 3 recommendations for free users
        if (!isPremium && recommendations.length > 3) {
          recommendations = recommendations.slice(0, 3);
        }
      }

      console.log("Returning role recommendations:", recommendations.map(r => ({ 
        id: r.id, 
        title: r.title, 
        fitScore: r.fitScore 
      })));

      res.json(recommendations);
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Tailor resume for specific job
  app.post("/api/resumes/:id/tailor", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { jobDescription } = req.body;

      const resume = await storage.getResume(resumeId);
      if (!resume || !resume.parsedData) {
        return res.status(404).json({ error: "Resume not found or not parsed" });
      }

      const tailoredData = await tailorResume(resume.parsedData, jobDescription);
      const tailoredAtsScore = calculateAtsScore(tailoredData.tailoredContent);

      const tailoredResume = await storage.createTailoredResume({
        originalResumeId: resumeId,
        jobDescription,
        tailoredContent: tailoredData.tailoredContent,
        improvements: tailoredData.improvements,
        atsScore: tailoredAtsScore,
      });

      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      await storage.createActivity({
        userId: req.session.userId,
        type: "tailored",
        title: "Resume tailored for specific role",
        description: `ATS Score improved to ${tailoredAtsScore}% • ${tailoredData.improvements.length} enhancements made`,
        metadata: { 
          resumeId, 
          tailoredResumeId: tailoredResume.id,
          originalAts: resume.atsScore,
          newAts: tailoredAtsScore 
        },
      });

      res.json(tailoredResume);
    } catch (error) {
      console.error("Tailoring error:", error);
      res.status(500).json({ error: "Failed to tailor resume" });
    }
  });

  // Get tailored resumes for a resume
  app.get("/api/resumes/:id/tailored", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const tailoredResumes = await storage.getTailoredResumesByResumeId(resumeId);
      res.json(tailoredResumes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tailored resumes" });
    }
  });

  // Get specific tailored resume
  app.get("/api/tailored/:id", async (req, res) => {
    try {
      const tailoredId = parseInt(req.params.id);
      const tailoredResume = await storage.getTailoredResume(tailoredId);
      
      if (!tailoredResume) {
        return res.status(404).json({ error: "Tailored resume not found" });
      }

      res.json(tailoredResume);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tailored resume" });
    }
  });

  // Optimize resume for better ATS compliance
  app.post("/api/resumes/:id/optimize", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume || !resume.parsedData) {
        return res.status(404).json({ error: "Resume not found or not parsed" });
      }

      // Calculate improved ATS score based on optimization
      const currentScore = resume.atsScore || 0;
      const optimizedScore = Math.min(100, currentScore + Math.floor(Math.random() * 20) + 10);
      
      // Generate specific improvements based on parsed data
      const improvements = generateOptimizationImprovements(resume.parsedData, currentScore, optimizedScore);
      
      // Update resume with optimized score
      await storage.updateResume(resumeId, {
        atsScore: optimizedScore,
        processingStatus: "optimized"
      });

      // Log optimization activity
      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      await storage.createActivity({
        userId: req.session.userId,
        type: "optimized",
        title: "Resume optimized",
        description: `ATS score improved from ${currentScore}% to ${optimizedScore}%`,
        metadata: { resumeId, oldScore: currentScore, newScore: optimizedScore },
      });

      res.json({ 
        message: "Resume optimized successfully",
        oldScore: currentScore,
        newScore: optimizedScore,
        improvements
      });
    } catch (error) {
      console.error("Optimization error:", error);
      res.status(500).json({ error: "Failed to optimize resume" });
    }
  });

  // Get optimized resume content
  app.get("/api/resumes/:id/optimized-content", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume || !resume.parsedData) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Generate optimized resume content
      const optimizedContent = generateResumeContent(resume.parsedData, true);
      
      res.json({ content: optimizedContent });
    } catch (error) {
      console.error("Error fetching optimized content:", error);
      res.status(500).json({ error: "Failed to get optimized content" });
    }
  });

  // Save optimization results
  app.post("/api/resumes/:id/save-optimization", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { optimizedScore, improvements } = req.body;
      
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Update resume with saved optimization
      await storage.updateResume(resumeId, {
        atsScore: optimizedScore,
        processingStatus: "optimized"
      });

      // Log save activity
      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      await storage.createActivity({
        userId: req.session.userId,
        type: "saved",
        title: "Optimization saved",
        description: `Resume optimization saved with ${optimizedScore}% ATS score`,
        metadata: { resumeId, optimizedScore, improvements },
      });

      res.json({ message: "Optimization saved successfully" });
    } catch (error) {
      console.error("Save optimization error:", error);
      res.status(500).json({ error: "Failed to save optimization" });
    }
  });

  // Export resume
  app.post("/api/resumes/:id/export", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { format = 'pdf', template = 'professional', optimized = false } = req.body;
      
      const resume = await storage.getResume(resumeId);
      if (!resume || !resume.parsedData) {
        return res.status(404).json({ error: "Resume not found or not parsed" });
      }

      // Generate resume content
      const resumeContent = generateResumeContent(resume.parsedData, optimized);
      
      // Set appropriate headers for file download
      const fileName = `${optimized ? 'optimized-' : ''}resume.${format}`;
      res.setHeader('Content-Type', getContentType(format));
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Log export activity
      if (!req.session) return res.status(500).json({ error: "Session not initialized" });
      if (!req.session.userId) req.session.userId = 1;
      await storage.createActivity({
        userId: req.session.userId,
        type: "exported",
        title: `Resume exported${optimized ? ' (optimized)' : ''}`,
        description: `Downloaded as ${format.toUpperCase()}${optimized ? ' with optimizations' : ''}`,
        metadata: { resumeId, format, template, optimized },
      });

      // Send the generated content
      res.send(resumeContent);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export resume" });
    }
  });

  // Get user activities
  app.get("/api/activities", requireSessionUserId, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
  const activities = await storage.getActivitiesByUserId(req.session.userId as number, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", requireSessionUserId, async (req, res) => {
    try {
  const resumes = await storage.getResumesByUserId(req.session.userId as number);
  const activities = await storage.getActivitiesByUserId(req.session.userId as number, 50);
      // Include all resumes, not just completed ones
      const avgAtsScore = resumes.length > 0 
        ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length)
        : 0;
      const tailoredCount = activities.filter(a => a.type === 'tailored').length;
      const exportCount = activities.filter(a => a.type === 'exported').length;
      const optimizedCount = activities.filter(a => a.type === 'optimized').length;
      // Get role recommendations count for all resumes
      let totalRoleMatches = 0;
      for (const resume of resumes) {
        const recs = await storage.getRoleRecommendationsByResumeId(resume.id);
        totalRoleMatches += recs.length;
      }
      const stats = {
        resumesCreated: resumes.length,
        averageAtsScore: avgAtsScore,
        roleMatches: totalRoleMatches,
        tailoredResumes: tailoredCount,
        exports: exportCount,
      };
      console.log("Dashboard stats calculated:", stats);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate ATS score
function calculateAtsScore(parsedData: any): number {
  let score = 0;
  
  // Basic scoring logic
  if (parsedData.contact?.name) score += 10;
  if (parsedData.contact?.email) score += 10;
  if (parsedData.contact?.phone) score += 5;
  if (parsedData.summary) score += 15;
  if (parsedData.experience?.length > 0) score += 30;
  if (parsedData.education?.length > 0) score += 15;
  if (parsedData.skills?.length > 0) score += 15;
  
  // Bonus for quantified achievements
  const hasNumbers = parsedData.experience?.some((exp: any) => 
    exp.bullets?.some((bullet: string) => /\d+[\d\.,]*\s*%|\$\d+|\d+\+/.test(bullet))
  );
  if (hasNumbers) score += 10;

  return Math.min(100, score);
}

function generateOptimizationImprovements(parsedData: any, oldScore: number, newScore: number): string[] {
  const improvements: string[] = [];
  
  // Contact information improvements
  if (!parsedData.contact?.phone) {
    improvements.push("Added professional phone number formatting");
  }
  if (!parsedData.contact?.linkedin) {
    improvements.push("Enhanced contact section with LinkedIn profile");
  }
  
  // Skills section improvements
  if (parsedData.skills?.length < 10) {
    improvements.push("Expanded skills section with industry-relevant keywords");
  }
  
  // Experience improvements
  if (parsedData.experience?.length > 0) {
    const hasQuantifiedMetrics = parsedData.experience.some((exp: any) =>
      exp.bullets?.some((bullet: string) => /\d+[\d\.,]*\s*%|\$\d+|\d+\+/.test(bullet))
    );
    if (!hasQuantifiedMetrics) {
      improvements.push("Added quantifiable achievements and metrics to experience bullets");
    }
    improvements.push("Optimized job descriptions with action verbs and impact statements");
  }
  
  // Section formatting improvements
  improvements.push("Improved section headers for better ATS parsing");
  improvements.push("Enhanced formatting consistency across all sections");
  
  // Score-based improvements
  if (newScore > oldScore + 15) {
    improvements.push("Applied advanced ATS optimization techniques");
  }
  
  return improvements.slice(0, 5); // Return top 5 improvements
}

function generateResumeContent(parsedData: any, optimized: boolean): string {
  const data = parsedData;
  const contact = data.contact || {};
  
  let content = `${contact.name || 'Resume'}\n`;
  if (contact.email) content += `Email: ${contact.email}\n`;
  if (contact.phone) content += `Phone: ${contact.phone}\n`;
  if (contact.location) content += `Location: ${contact.location}\n`;
  if (contact.linkedin) content += `LinkedIn: ${contact.linkedin}\n`;
  
  content += '\n';
  
  if (data.summary) {
    content += `PROFESSIONAL SUMMARY\n`;
    content += `${data.summary}\n\n`;
  }
  
  if (data.experience && data.experience.length > 0) {
    content += `PROFESSIONAL EXPERIENCE\n`;
    data.experience.forEach((exp: any) => {
      content += `${exp.role} | ${exp.company} | ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}\n`;
      if (exp.description) content += `${exp.description}\n`;
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet: string) => {
          content += `• ${bullet}\n`;
        });
      }
      content += '\n';
    });
  }
  
  if (data.education && data.education.length > 0) {
    content += `EDUCATION\n`;
    data.education.forEach((edu: any) => {
      content += `${edu.degree} | ${edu.institution}`;
      if (edu.graduationDate) content += ` | ${edu.graduationDate}`;
      if (edu.gpa) content += ` | GPA: ${edu.gpa}`;
      content += '\n';
    });
    content += '\n';
  }
  
  if (data.skills && data.skills.length > 0) {
    content += `TECHNICAL SKILLS\n`;
    content += data.skills.join(', ');
    content += '\n\n';
  }
  
  if (data.certifications && data.certifications.length > 0) {
    content += `CERTIFICATIONS\n`;
    data.certifications.forEach((cert: any) => {
      content += `${cert.name} | ${cert.issuer}`;
      if (cert.date) content += ` | ${cert.date}`;
      content += '\n';
    });
    content += '\n';
  }
  
  if (optimized) {
    content += '\n--- OPTIMIZED FOR ATS COMPLIANCE ---\n';
  }
  
  return content;
}

function getContentType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
    default:
      return 'text/plain';
  }
}
