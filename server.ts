import express from "express";
import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import { repos } from "./server/repositories/RepositoryProvider.js";
import {
  hashPassword,
  generateToken,
  authenticateJWT,
  AuthenticatedRequest
} from "./server/auth.js";
import {
  analyzeResumeWithAI,
  generateLearningRoadmapWithAI,
  generateCareerInsightsWithAI,
  fixBulletPointsWithAI,
  matchResumeWithJD,
  optimizeResumeWithAI,
  generateResumeFromScratch,
  extractTextFromPDF,
  enhanceResumeWithAI
} from "./server/gemini.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

  // JSON parsing with size limit for PDF or text base64 resume uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // --- API Authentication Routes ---

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields (email, password, name)." });
      }

      const userRepo = repos.getUserRepository();
      const existingUser = await userRepo.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered." });
      }

      const hash = hashPassword(password);
      const newUser = await userRepo.createUser({
        id: "user-" + Math.random().toString(36).substring(2, 11),
        email: email.toLowerCase(),
        passwordHash: hash,
        name,
        createdAt: new Date().toISOString()
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      });

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Failed to register user." });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password." });
      }

      const userRepo = repos.getUserRepository();
      const user = await userRepo.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const hash = hashPassword(password);
      if (user.passwordHash !== hash) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Failed to login." });
    }
  });

  // Get current user details
  app.get("/api/auth/me", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userRepo = repos.getUserRepository();
      const user = await userRepo.getUserById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (err) {
      console.error("Auth verification error:", err);
      res.status(500).json({ error: "Server authentication error." });
    }
  });

  // --- Job Application Tracker CRUD Routes ---

  // Get applications count or detailed filters
  app.get("/api/applications", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const jobRepo = repos.getJobRepository();
      const apps = await jobRepo.getApplications(req.user.id);
      res.json(apps);
    } catch (err) {
      console.error("Error retrieving applications:", err);
      res.status(500).json({ error: "Database retrieval error." });
    }
  });

  // Add application
  app.post("/api/applications", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { company, role, appliedDate, status, salary, location, jobDescription, notes } = req.body;
      
      if (!company || !role || !appliedDate || !status) {
        return res.status(400).json({ error: "Missing required tracking parameters." });
      }

      const jobRepo = repos.getJobRepository();
      const newApp = await jobRepo.createApplication({
        company,
        role,
        appliedDate,
        status,
        salary,
        location,
        jobDescription,
        notes
      }, req.user.id);

      res.status(201).json(newApp);
    } catch (err) {
      console.error("Error creating application:", err);
      res.status(500).json({ error: "Failed to create application entry." });
    }
  });

  // Edit/Update application
  app.put("/api/applications/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;
      const jobRepo = repos.getJobRepository();
      const updated = await jobRepo.updateApplication(id, req.user.id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Job application not found." });
      }

      res.json(updated);
    } catch (err) {
      console.error("Error updating application:", err);
      res.status(500).json({ error: "Failed to update application details." });
    }
  });

  // Delete application
  app.delete("/api/applications/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;
      const jobRepo = repos.getJobRepository();
      const success = await jobRepo.deleteApplication(id, req.user.id);
      
      if (!success) {
        return res.status(404).json({ error: "Application record not found." });
      }

      res.json({ message: "Successfully deleted application track." });
    } catch (err) {
      console.error("Error deleting application:", err);
      res.status(500).json({ error: "Failed to delete tracking records." });
    }
  });

  // --- Resume management Routes ---

  // List user resumes
  app.get("/api/resumes", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const resumeRepo = repos.getResumeRepository();
      const resumes = await resumeRepo.getResumes(req.user.id);
      res.json(resumes);
    } catch (err) {
      console.error("Error retrieving resumes:", err);
      res.status(500).json({ error: "Failed to load resumes." });
    }
  });

  // Create/Upload custom resume
  app.post("/api/resumes", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { filename, parseText, fileSize } = req.body;

      if (!filename || !parseText) {
        return res.status(400).json({ error: "Filename and clear text of resume are requested." });
      }

      const resumeRepo = repos.getResumeRepository();
      const newResume = await resumeRepo.createResume({
        filename,
        parseText,
        fileSize: fileSize || "Unknown size"
      }, req.user.id);

      res.status(201).json(newResume);
    } catch (err) {
      console.error("Error creating resume:", err);
      res.status(500).json({ error: "Failed to register new resume draft." });
    }
  });

  // Delete custom resume
  app.delete("/api/resumes/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;
      const resumeRepo = repos.getResumeRepository();
      const success = await resumeRepo.deleteResume(id, req.user.id);

      if (!success) {
        return res.status(404).json({ error: "Resume draft files not found." });
      }

      res.json({ message: "Deleted resume version successfully." });
    } catch (err) {
      console.error("Error deleting resume content:", err);
      res.status(500).json({ error: "Failed to delete files." });
    }
  });

  // Parse PDF resume via Gemini
  app.post("/api/resumes/parse-pdf", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { filename, base64Data } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "base64Data is required." });
      }
      const parseText = await extractTextFromPDF(base64Data);
      res.json({ parseText });
    } catch (err) {
      console.error("Error parsing PDF resume:", err);
      res.status(500).json({ error: "Failed to parse PDF resume." });
    }
  });

  // Enhance resume text to 90%+ target
  app.post("/api/resumes/enhance", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { resumeText } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "resumeText is required." });
      }
      const { enhancedText } = await enhanceResumeWithAI(resumeText);
      res.json({ enhancedText });
    } catch (err) {
      console.error("Error enhancing resume:", err);
      res.status(500).json({ error: "Failed to enhance resume." });
    }
  });

  // Rewrite bullet points using STAR method
  app.post("/api/resumes/fix-bullets", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { bulletPoints } = req.body;
      if (!bulletPoints || !Array.isArray(bulletPoints)) {
        return res.status(400).json({ error: "bulletPoints string array is required." });
      }

      const rewritten = await fixBulletPointsWithAI(bulletPoints);
      res.json({ bulletPoints: rewritten });
    } catch (err) {
      console.error("Error fixing bullet points:", err);
      res.status(500).json({ error: "Failed to rewrite bullet points using AI." });
    }
  });

  // Compare resume against JD
  app.post("/api/resumes/match-jd", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { resumeText, jobDescription } = req.body;
      if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: "resumeText and jobDescription are required fields." });
      }

      const matchResult = await matchResumeWithJD(resumeText, jobDescription);
      res.json(matchResult);
    } catch (err) {
      console.error("Error matching resume with JD:", err);
      res.status(500).json({ error: "Failed to analyze job description match." });
    }
  });

  // Optimize resume JSON structure for role
  app.post("/api/resumes/optimize", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { resumeData, targetRole } = req.body;
      if (!resumeData || !targetRole) {
        return res.status(400).json({ error: "resumeData and targetRole are required fields." });
      }

      const optimized = await optimizeResumeWithAI(resumeData, targetRole);
      res.json(optimized);
    } catch (err) {
      console.error("Error optimizing resume JSON:", err);
      res.status(500).json({ error: "Failed to optimize resume via AI." });
    }
  });

  // Generate resume from scratch
  app.post("/api/resumes/generate-scratch", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { name, targetRole, skills, rawExperience } = req.body;
      if (!name || !targetRole || !skills || !rawExperience) {
        return res.status(400).json({ error: "Missing required parameters to generate resume." });
      }

      const generated = await generateResumeFromScratch(name, targetRole, skills, rawExperience);
      res.json(generated);
    } catch (err) {
      console.error("Error generating resume from scratch:", err);
      res.status(500).json({ error: "Failed to generate resume from scratch." });
    }
  });

  // --- AI Resume Analysis Routes ---

  // Perform Gemini AI Resume audit and analysis
  app.post("/api/resumes/:id/analyze", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;

      const resumeRepo = repos.getResumeRepository();
      const resumeObj = await resumeRepo.getResume(id, req.user.id);
      if (!resumeObj) {
        return res.status(404).json({ error: "Target resume draft files not found." });
      }

      // Query AI to analyze
      const aiResponse = await analyzeResumeWithAI(resumeObj.parseText);

      // Save analysis results for user tracking
      const aiAnalysisRepo = repos.getAIAnalysisRepository();
      const finalAnalysis = await aiAnalysisRepo.createAnalysis({
        resumeId: id,
        atsScore: aiResponse.atsScore,
        missingKeywords: aiResponse.missingKeywords,
        suggestions: aiResponse.suggestions,
        improvedBulletPoints: aiResponse.improvedBulletPoints
      }, req.user.id);

      res.json(finalAnalysis);
    } catch (err) {
      console.error("Error calculating ATS review scores:", err);
      res.status(500).json({ error: "Failed to conduct AI analysis audit. Please verify your Gemini setup." });
    }
  });

  // Fetch analysis results
  app.get("/api/resumes/:id/analysis", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;

      const aiAnalysisRepo = repos.getAIAnalysisRepository();
      const analysisObj = await aiAnalysisRepo.getAnalysisByResume(id, req.user.id);
      if (!analysisObj) {
        return res.status(404).json({ error: "No analysis reports have been calculated for this resume yet." });
      }

      res.json(analysisObj);
    } catch (err) {
      console.error("Error reading analysis report:", err);
      res.status(500).json({ error: "Failed to serve analysis file statistics." });
    }
  });

  // --- Career GPS Learning Roadmap Routes ---

  // Get users calculated roadmaps
  app.get("/api/career/roadmaps", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const roadmapRepo = repos.getRoadmapRepository();
      const roadmaps = await roadmapRepo.getRoadmaps(req.user.id);
      res.json(roadmaps);
    } catch (err) {
      console.error("Error serving maps list:", err);
      res.status(500).json({ error: "Failed to load learning maps paths." });
    }
  });

  // Create dynamic new roadmap using prompt inputs
  app.post("/api/career/roadmap", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { currentSkills, targetRole } = req.body;

      if (!currentSkills || !Array.isArray(currentSkills) || !targetRole) {
        return res.status(400).json({ error: "currentSkills list and targetRole are requested parameters." });
      }

      const generatedSteps = await generateLearningRoadmapWithAI(currentSkills, targetRole);

      const roadmapRepo = repos.getRoadmapRepository();
      const savedRoadmap = await roadmapRepo.createRoadmap({
        currentSkills,
        targetRole,
        roadmapSteps: generatedSteps
      }, req.user.id);

      res.status(201).json(savedRoadmap);
    } catch (err) {
      console.error("Error establishing learning GPS path:", err);
      res.status(500).json({ error: "Failed to synthesize career roadmap files via AI." });
    }
  });

  // --- Deep Analytics Dashboard Metrics ---

  app.get("/api/analytics/dashboard", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const jobRepo = repos.getJobRepository();
      const apps = await jobRepo.getApplications(req.user.id);
      
      // Calculate applications per status count
      const statusCounts = {
        Applied: 0,
        Interview: 0,
        Rejected: 0,
        Offer: 0
      };
      
      // Group by year-month for monthly trend (recharts)
      const monthlyCounts: Record<string, { month: string; applications: number; replies: number }> = {};
      
      // Group by applied domain
      const domains: Record<string, number> = {};

      apps.forEach(app => {
        // Status sum
        if (app.status in statusCounts) {
          statusCounts[app.status as keyof typeof statusCounts]++;
        }

        // Domain extraction safely
        let domain = app.company.trim();
        // Capitalize nice
        domains[domain] = (domains[domain] || 0) + 1;

        // Monthly parsing
        // expect format YYYY-MM-DD
        try {
          const datePart = app.appliedDate.split("-");
          if (datePart.length >= 2) {
            const yearMonthStr = `${datePart[0]}-${datePart[1]}`;
            // convert to legible month name
            const d = new Date(app.appliedDate);
            const labelStr = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            if (!monthlyCounts[yearMonthStr]) {
              monthlyCounts[yearMonthStr] = { month: labelStr, applications: 0, replies: 0 };
            }
            monthlyCounts[yearMonthStr].applications++;
            if (app.status === "Interview" || app.status === "Offer") {
              monthlyCounts[yearMonthStr].replies++;
            }
          }
        } catch {
          // ignore date parse errors
        }
      });

      // Format trends chronologically
      const monthlyTrends = Object.keys(monthlyCounts)
        .sort()
        .map(k => monthlyCounts[k]);

      // If trends is empty, provide mock structure but correct counts for demo visualizer
      if (monthlyTrends.length === 0) {
        monthlyTrends.push({ month: "Jun 26", applications: 0, replies: 0 });
      }

      // Format domain stats formatted for pie chart
      const domainDistribution = Object.keys(domains)
        .map(name => ({ name, value: domains[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5 only

      // Calculate total success rates
      const totalCount = apps.length;
      const responseCount = apps.filter(a => a.status !== "Applied").length;
      const interviewCount = apps.filter(a => a.status === "Interview" || a.status === "Offer").length;
      const offerCount = apps.filter(a => a.status === "Offer").length;

      const interviewSuccessRate = totalCount > 0 ? Math.round((interviewCount / totalCount) * 100) : 0;
      const rejectionRatio = totalCount > 0 ? Math.round((apps.filter(a => a.status === "Rejected").length / totalCount) * 100) : 0;

      res.json({
        totalCount,
        statusCounts,
        monthlyTrends,
        domainDistribution,
        interviewSuccessRate,
        rejectionRatio,
        offerCount
      });
    } catch (err) {
      console.error("Dashboard calculation error:", err);
      res.status(500).json({ error: "Failed to gather analytics dashboards parameters." });
    }
  });

  // Generate dynamic predictive career insight notes & predictions
  app.get("/api/analytics/insights", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const jobRepo = repos.getJobRepository();
      const apps = await jobRepo.getApplications(req.user.id);
      
      const resumeRepo = repos.getResumeRepository();
      const resumes = await resumeRepo.getResumes(req.user.id);
      
      // Gather latest resume skills if any found
      let resumeSkills: string[] = ["React", "TypeScript", "Node.js", "Express", "REST APIs", "SQL", "Git"];
      if (resumes.length > 0) {
        // use last uploaded resume text
        const text = resumes[resumes.length - 1].parseText;
        // Simple skill extraction
        const matchedSkills: string[] = [];
        const possibleSkills = ["React", "TypeScript", "HTML", "CSS", "SQL", "Tailwind Code", "Docker", "AWS", "Python", "Node.js", "Express", "Rust", "Next.js", "MySQL", "Postgres", "MongoDB"];
        possibleSkills.forEach(s => {
          if (text.toLowerCase().includes(s.toLowerCase())) matchedSkills.push(s);
        });
        if (matchedSkills.length > 0) resumeSkills = matchedSkills;
      }

      const formattedApps = apps.map(a => ({
        company: a.company,
        role: a.role,
        status: a.status,
        appliedDate: a.appliedDate
      }));

      const insightsResult = await generateCareerInsightsWithAI(formattedApps, resumeSkills);
      res.json(insightsResult);
    } catch (err) {
      console.error("Failed to compile AI insights:", err);
      res.status(500).json({ error: "Failed to load dynamic forecasting insights." });
    }
  });

  // --- Serve Frontend Application ---

  if (process.env.VERCEL !== "1") {
    const startLocalServer = async () => {
      // Dev server handles the serving itself using Vite's middleware, or Production falls back to statically built assets
      if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa"
        });
        app.use(vite.middlewares);
        console.log("Vite development server middleware mounted.");
      } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
        console.log("Static files serving mounted from dist/");
      }

      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Gowtham CareerPilot AI Server started at: http://localhost:${PORT}`);
        console.log(`Port is active in background container`);
      });
    };

    startLocalServer().catch(err => {
      console.error("FATAL: Failed to launch Express Full-Stack server", err);
      process.exit(1);
    });
  }

export default app;
