import fs from "fs";
import path from "path";
import crypto from "crypto";

const isVercel = process.env.VERCEL === "1";
const DB_FILE_PATH = isVercel
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "db.json");

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  appliedDate: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  salary?: string;
  location?: string;
  jobDescription?: string;
  notes?: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  parseText: string;
  fileSize: string;
  uploadedAt: string;
}

export interface AIAnalysis {
  id: string;
  resumeId: string;
  userId: string;
  atsScore: number;
  missingKeywords: string[];
  suggestions: string[];
  improvedBulletPoints: string[];
  analyzedAt: string;
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  currentSkills: string[];
  targetRole: string;
  roadmapSteps: {
    title: string;
    description: string;
    timeline: string;
    resources: string[];
  }[];
  createdAt: string;
}

interface DBStructure {
  users: User[];
  applications: JobApplication[];
  resumes: Resume[];
  aiAnalysis: AIAnalysis[];
  roadmaps: LearningRoadmap[];
}

const DEFAULT_DB: DBStructure = {
  users: [],
  applications: [],
  resumes: [],
  aiAnalysis: [],
  roadmaps: []
};

function hashString(str: string): string {
  return crypto.createHmac("sha256", "salt_pilot").update(str).digest("hex");
}

class Database {
  private data: DBStructure = { ...DEFAULT_DB };

  constructor() {
    if (isVercel) {
      const sourcePath = path.join(process.cwd(), "db.json");
      if (!fs.existsSync(DB_FILE_PATH) && fs.existsSync(sourcePath)) {
        try {
          fs.copyFileSync(sourcePath, DB_FILE_PATH);
          console.log("Copied template db.json to /tmp for Vercel write access.");
        } catch (err) {
          console.error("Failed to copy db.json to /tmp", err);
        }
      }
    }
    this.load();
    if (this.data.users.length === 0) {
      this.seedDemoData();
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { ...DEFAULT_DB };
        this.save();
      }
    } catch (e) {
      console.error("Failed to load db.json, using fallback", e);
      this.data = { ...DEFAULT_DB };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to db.json", e);
    }
  }

  private seedDemoData() {
    console.log("Seeding Gowtham CareerPilot AI Demo Data...");
    const demoUserId = "demo-user-id";
    const demoUser: User = {
      id: demoUserId,
      email: "demo@careerpilot.ai",
      passwordHash: hashString("demo123"),
      name: "Alex Spencer",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const demoApps: JobApplication[] = [
      {
        id: "app-1",
        userId: demoUserId,
        company: "Google",
        role: "Software Engineer",
        appliedDate: "2026-05-15",
        status: "Interview",
        salary: "$160,000",
        location: "Mountain View, CA (Hybrid)",
        jobDescription: "Build next-generation cloud infrastructure and generative AI models using Node.js, Go and React.",
        notes: "Passed the initial technical phone screen! Virtual on-site scheduled for next week. Focus on system design and dynamic programming.",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "app-2",
        userId: demoUserId,
        company: "Stripe",
        role: "Full Stack Engineer",
        appliedDate: "2026-05-10",
        status: "Applied",
        salary: "$150,000",
        location: "San Francisco, CA",
        jobDescription: "Help scale our billing engine developer dashboards utilizing React, TypeScript, and high-performance server architecture.",
        notes: "Applied via referral from former coworker. Recruiter said they are reviewing resumes this batch.",
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "app-3",
        userId: demoUserId,
        company: "Netflix",
        role: "Senior UI Architect",
        appliedDate: "2026-06-01",
        status: "Offer",
        salary: "$210,000",
        location: "Los Gatos, CA",
        jobDescription: "Lead the UI foundation team. Maximize render performance, design system guidelines, and media-streaming player UX.",
        notes: "Received written offer! Base salary is incredible, with great benefits. Need to decide of other processes finish.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "app-4",
        userId: demoUserId,
        company: "Meta",
        role: "Frontend Engineer",
        appliedDate: "2026-05-20",
        status: "Rejected",
        salary: "$175,000",
        location: "Menlo Park, CA (Hybrid)",
        jobDescription: "Design, develop and scale modern React products across Instagram Web portal and messaging dashboards.",
        notes: "Completed final loop, but received rejection letter on system design panel. Keep studying distributed services.",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "app-5",
        userId: demoUserId,
        company: "Vercel",
        role: "Developer Advocate",
        appliedDate: "2026-06-05",
        status: "Interview",
        salary: "$135,000",
        location: "Remote",
        jobDescription: "Help developers deploy, scale, and master Next.js, Edge compute, and AI integrations globally.",
        notes: "First screen with director of advocate relations went amazingly well. Recording a short Loom video demo'ing an Express-Next proxy next.",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const demoResume: Resume = {
      id: "resume-1",
      userId: demoUserId,
      filename: "Alex_Spencer_FullStack_Resume.pdf",
      parseText: "Alex Spencer\nFull Stack Software Engineer\n\nExperience:\n- Software Engineer at RetailFlow (2024-Present): Lead UI rebuild in React 18, improving initial load time by 35%. Wrote backend APIs in Express and Node.\n- Associate Dev at CoreTech Systems (2022-2024): Designed REST APIs in Django, built responsive web applications.\n\nSkills: React, JavaScript, TypeScript, Node.js, Express, HTML, CSS, SQL, Git, Docker, Python.",
      fileSize: "142 KB",
      uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    const demoAnalysis: AIAnalysis = {
      id: "analysis-1",
      resumeId: "resume-1",
      userId: demoUserId,
      atsScore: 78,
      missingKeywords: ["Next.js", "Redis", "CI/CD", "AWS Cloud", "GraphQL", "Tailwind CSS"],
      suggestions: [
        "Include metrics and bullet points showcasing quantified commercial outcomes (e.g., 'saved 40h/mo by automating standard pipelines')",
        "Expand on cloud technologies (like Amazon AWS, ECS, or GCP) if targeting principal SaaS companies",
        "Add Redis or Memcached under databases segment since many modern backend jobs require caching know-how",
        "Explain test coverage techniques (e.g. Jest, Cypress) to prove production-readiness"
      ],
      improvedBulletPoints: [
        "Led high-traffic retail checkout redesign using React and TypeScript, boosting client-side routing efficiency and directly increasing conversion by 4.2%",
        "Co-developed microservices server architecture in Express/Node.js to handle 10k+ concurrent requests, decreasing DB lookups by caching key endpoints"
      ],
      analyzedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    const demoRoadmap: LearningRoadmap = {
      id: "roadmap-1",
      userId: demoUserId,
      currentSkills: ["React", "TypeScript", "Node.js", "SQL"],
      targetRole: "Senior Generative AI Fullstack Developer",
      roadmapSteps: [
        {
          title: "Generative AI Foundations & LLMs",
          description: "Master the basics of tokenization, embeddings, and API calls. Learn how to construct clean system prompts, handle rate limits, and select models depending on speed/quality constraints.",
          timeline: "Weeks 1-2",
          resources: ["Google AI Studio - Gemini API Guide", "DeepLearning.AI: Prompt Engineering for Developers"]
        },
        {
          title: "Vector Databases & Semantic Search",
          description: "Build semantic search triggers. Integrate Pinecone, Milvus or SQLite-VSS vectors database with your Node.js apps. Store Embeddings using standard models.",
          timeline: "Weeks 3-4",
          resources: ["Pinecone Quickstart Hub", "LangChain TS: Introduction to Vector Stores"]
        },
        {
          title: "RAG (Retrieval-Augmented Generation) Orchestration",
          description: "Develop server APIs that ingest resume PDFs/docs, slice texts into chunks, append vector overlaps, and query Gemini API to build Q&A assistants.",
          timeline: "Weeks 5-6",
          resources: ["LlamaIndex TS Guides", "Vercel AI SDK Templates"]
        },
        {
          title: "Real-time AI Streams & WebSockets",
          description: "Implement interactive streaming chat bubbles or bidirectional speech via Gemini Live API. Optimize client re-renders and use Server-Sent Events (SSE).",
          timeline: "Weeks 7-8",
          resources: ["@google/genai SDK Documentation", "WebSockets in Custom Node servers with Client AudioCtx"]
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.data.users.push(demoUser);
    this.data.applications.push(...demoApps);
    this.data.resumes.push(demoResume);
    this.data.aiAnalysis.push(demoAnalysis);
    this.data.roadmaps.push(demoRoadmap);
    this.save();
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Applications
  getApplications(userId: string): JobApplication[] {
    return this.data.applications.filter(a => a.userId === userId);
  }

  getApplication(id: string, userId: string): JobApplication | undefined {
    return this.data.applications.find(a => a.id === id && a.userId === userId);
  }

  createApplication(app: Omit<JobApplication, "id" | "createdAt" | "userId">, userId: string): JobApplication {
    const newApp: JobApplication = {
      ...app,
      id: "app-" + crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString()
    };
    this.data.applications.push(newApp);
    this.save();
    return newApp;
  }

  updateApplication(id: string, userId: string, updates: Partial<JobApplication>): JobApplication | null {
    const idx = this.data.applications.findIndex(a => a.id === id && a.userId === userId);
    if (idx === -1) return null;
    const updated = { ...this.data.applications[idx], ...updates, id, userId };
    this.data.applications[idx] = updated;
    this.save();
    return updated;
  }

  deleteApplication(id: string, userId: string): boolean {
    const initialLen = this.data.applications.length;
    this.data.applications = this.data.applications.filter(a => !(a.id === id && a.userId === userId));
    const deleted = this.data.applications.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Resumes
  getResumes(userId: string): Resume[] {
    return this.data.resumes.filter(r => r.userId === userId);
  }

  getResume(id: string, userId: string): Resume | undefined {
    return this.data.resumes.find(r => r.id === id && r.userId === userId);
  }

  createResume(resume: Omit<Resume, "id" | "uploadedAt" | "userId">, userId: string): Resume {
    const newResume: Resume = {
      ...resume,
      id: "resume-" + crypto.randomUUID(),
      userId,
      uploadedAt: new Date().toISOString()
    };
    this.data.resumes.push(newResume);
    this.save();
    return newResume;
  }

  deleteResume(id: string, userId: string): boolean {
    const initialLen = this.data.resumes.length;
    this.data.resumes = this.data.resumes.filter(r => !(r.id === id && r.userId === userId));
    this.data.aiAnalysis = this.data.aiAnalysis.filter(ans => !(ans.resumeId === id && ans.userId === userId));
    const deleted = this.data.resumes.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // AI Analysis
  getAnalysisByResume(resumeId: string, userId: string): AIAnalysis | undefined {
    return this.data.aiAnalysis.find(ans => ans.resumeId === resumeId && ans.userId === userId);
  }

  createAnalysis(analysis: Omit<AIAnalysis, "id" | "analyzedAt" | "userId">, userId: string): AIAnalysis {
    // Delete existing analysis for this resume if any
    this.data.aiAnalysis = this.data.aiAnalysis.filter(ans => !(ans.resumeId === analysis.resumeId && ans.userId === userId));
    
    const newAnalysis: AIAnalysis = {
      ...analysis,
      id: "analysis-" + crypto.randomUUID(),
      userId,
      analyzedAt: new Date().toISOString()
    };
    this.data.aiAnalysis.push(newAnalysis);
    this.save();
    return newAnalysis;
  }

  // Roadmaps
  getRoadmaps(userId: string): LearningRoadmap[] {
    return this.data.roadmaps.filter(r => r.userId === userId);
  }

  createRoadmap(roadmap: Omit<LearningRoadmap, "id" | "createdAt" | "userId">, userId: string): LearningRoadmap {
    const newRoadmap: LearningRoadmap = {
      ...roadmap,
      id: "roadmap-" + crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString()
    };
    this.data.roadmaps.push(newRoadmap);
    this.save();
    return newRoadmap;
  }
}

export const db = new Database();
