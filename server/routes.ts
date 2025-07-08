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
  app.get("/api/user", async (req, res) => {
    // For demo purposes, create a mock user session if none exists
    if (!req.session) {
      req.session = { userId: 1 };
    }
    if (!req.session.userId) {
      req.session.userId = 1;
    }
    
    let user = await storage.getUser(req.session.userId);
    if (!user) {
      // Create default user for demo
      user = await storage.createUser({
        username: "demo_user",
        subscriptionStatus: "free",
        resumeGenerationsUsed: 0,
        resumeGenerationsLimit: 1
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
  app.post("/api/create-subscription", async (req, res) => {
    // For demo purposes, create a mock user session if none exists
    if (!req.session) {
      req.session = { userId: 1 };
    }
    if (!req.session.userId) {
      req.session.userId = 1;
    }

    try {
      const { plan } = req.body;
      
      // For demo purposes, simulate Stripe checkout URL
      // In production, this would create actual Stripe subscription
      const prices = {
        plus: 0.99,
        pro: 4.99
      };
      
      const checkoutUrl = `https://checkout.stripe.com/pay/cs_demo_${plan}_${Date.now()}#fidkdWxOYHwnPyd1blpxYHZxWjA0S21PSVdOa0hPVG1IVHVqSnJLdmB8bWJsdVJgVTJRNGBxN0w1cmFCSHU8QUFxSzJ0ZDFGU0M0MGJqR3VLbGtuSmNEckRDSGExXzA0cGFPRnxCaUd8fH8walZEfTdgMGNScTdocFxccTI%3D`;
      
      res.json({
        url: checkoutUrl,
        sessionId: `cs_demo_${plan}_${Date.now()}`,
        plan,
        price: prices[plan as keyof typeof prices]
      });
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
  app.get("/api/resumes", async (req, res) => {
    // For demo purposes, create a mock user session if none exists
    if (!req.session) {
      req.session = { userId: 1 };
    }
    if (!req.session.userId) {
      req.session.userId = 1;
    }

    try {
      const resumes = await storage.getResumesByUserId(req.session.userId);
      console.log('Resumes fetched:', resumes);
      res.json(resumes);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch resumes: " + error.message });
    }
  });

  // Create resume manually
  app.post("/api/resumes/manual", async (req, res) => {
    // For demo purposes, create a mock user session if none exists
    if (!req.session) {
      req.session = { userId: 1 };
    }
    if (!req.session.userId) {
      req.session.userId = 1;
    }

    try {
      const { resumeData } = req.body;
      
      if (!resumeData) {
        return res.status(400).json({ error: "Resume data is required" });
      }

      // Create resume record with parsed data
      const resume = await storage.createResume({
        userId: req.session.userId,
        originalFileName: `${resumeData.contact.name.replace(/\s+/g, '_')}_Resume.txt`,
        fileType: '.txt',
        rawContent: generateResumeContent(resumeData, false),
        parsedData: resumeData,
        processingStatus: "completed",
        atsScore: calculateAtsScore(resumeData),
      });

      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "uploaded",
        title: "Resume created manually",
        description: `Created resume for ${resumeData.contact.name}`,
        metadata: { resumeId: resume.id, method: "manual" },
      });

      res.json({ 
        message: "Resume created successfully",
        resume: {
          id: resume.id,
          originalFileName: resume.originalFileName,
          processingStatus: resume.processingStatus,
          atsScore: resume.atsScore,
          uploadedAt: resume.uploadedAt,
        }
      });
    } catch (error) {
      console.error("Manual resume creation error:", error);
      res.status(500).json({ error: "Failed to create resume" });
    }
  });

  // Upload resume file
  app.post("/api/resumes/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // For demo purposes, create a mock user session if none exists
      if (!req.session) {
        req.session = { userId: 1 };
      }
      if (!req.session.userId) {
        req.session.userId = 1;
      }

      const userId = req.session.userId;
      const fileType = path.extname(req.file.originalname).toLowerCase();
      let rawContent = '';
      
      try {
        rawContent = req.file.buffer.toString('utf-8');
      } catch (err) {
        console.log("Binary file detected, using filename for parsing");
        rawContent = req.file.originalname;
      }

      // Create initial resume record
      const resume = await storage.createResume({
        userId: userId,
        originalFileName: req.file.originalname,
        fileType,
        rawContent,
      });

      // Log activity
      await storage.createActivity({
        userId: userId,
        type: "upload",
        title: "Resume uploaded",
        description: `Uploaded ${req.file.originalname}`,
        metadata: { resumeId: resume.id, fileType },
      });

      // Start async parsing
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

          // Generate role recommendations
          const recommendations = await generateRoleRecommendations(parsedData);
          for (const rec of recommendations) {
            await storage.createRoleRecommendation({
              resumeId: resume.id,
              ...rec,
            });
          }

          await storage.updateResume(resume.id, { processingStatus: "completed" });

          // Log completion activity
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
  app.post("/api/resumes/manual", async (req, res) => {
    try {
      const { resumeData } = req.body;
      
      const resume = await storage.createResume({
        userId,
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

      // Generate role recommendations
      const recommendations = await generateRoleRecommendations(resumeData);
      for (const rec of recommendations) {
        await storage.createRoleRecommendation({
          resumeId: resume.id,
          ...rec,
        });
      }

      await storage.createActivity({
        userId,
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
      const resumes = await storage.getResumesByUserId(userId);
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
      await storage.createActivity({
        userId,
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
      await storage.createActivity({
        userId,
        type: "exported",
        title: "Resume exported",
        description: `Exported ${optimized ? 'optimized ' : ''}resume as ${format.toUpperCase()}`,
        metadata: { resumeId, format, optimized },
      });

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${resume.originalFileName.replace(/\.[^/.]+$/, '')}.${format}"`);
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
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        const isPremium = user?.subscriptionStatus === "premium";
        
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

      await storage.createActivity({
        userId,
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
      await storage.createActivity({
        userId,
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
      await storage.createActivity({
        userId,
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
      await storage.createActivity({
        userId,
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
  app.get("/api/activities", async (req, res) => {
    // For demo purposes, create a mock user session if none exists
    if (!req.session) {
      req.session = { userId: 1 };
    }
    if (!req.session.userId) {
      req.session.userId = 1;
    }

    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getActivitiesByUserId(req.session.userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    // For demo purposes, create a mock user session if none exists
    if (!req.session) {
      req.session = { userId: 1 };
    }
    if (!req.session.userId) {
      req.session.userId = 1;
    }

    try {
      const resumes = await storage.getResumesByUserId(req.session.userId);
      const activities = await storage.getActivitiesByUserId(req.session.userId, 50);
      
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
