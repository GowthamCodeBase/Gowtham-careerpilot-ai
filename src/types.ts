export interface User {
  id: string;
  name: string;
  email: string;
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

 
export interface DashboardStats {
  totalCount: number;
  statusCounts: {
    Applied: number;
    Interview: number;
    Rejected: number;
    Offer: number;
  };
  monthlyTrends: {
    month: string;
    applications: number;
    replies: number;
  }[];
  domainDistribution: {
    name: string;
    value: number;
  }[];
  interviewSuccessRate: number;
  rejectionRatio: number;
  offerCount: number;
}

export interface AIInsights {
  interviewProbability: number;
  probJustification: string;
  suggestedCompanies: {
    name: string;
    reason: string;
    openRoles: string[];
  }[];
  missingSkillsSuggestions: {
    skill: string;
    priority: "High" | "Medium";
    resource: string;
  }[];
  overallAdvice: string;
}

export interface CareerProfile {
  id: string;
  userId: string;
  currentRole: string;
  targetRole: string;
  industry: string;
  yearsExperience: number;
  location: string;
  skills: { name: string; level: string; years: number }[];
  education: { degree: string; institution: string; year: number }[];
  certifications: { name: string; issuer: string; date: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillAnalysis {
  id: string;
  profileId: string;
  userId: string;
  targetRole: string;
  requiredSkills: { name: string; importance: string; typicalLevel: string }[];
  existingSkills: { name: string; currentLevel: string; match: boolean }[];
  missingSkills: { name: string; priority: "High" | "Medium" | "Low"; learningTimeline: string }[];
  certifications: string[];
  computedAt: string;
}

export interface CareerHealthScore {
  id: string;
  profileId: string;
  userId: string;
  overallScore: number;
  resumeScore: number;
  skillScore: number;
  applicationScore: number;
  interviewScore: number;
  roadmapScore: number;
  timestamp: string;
}

export interface ResumeIntelligence {
  id: string;
  resumeId: string;
  userId: string;
  atsScore: number;
  keywordCoverage: number;
  impactScore: number;
  achievementDensity: number;
  actionVerbDensity: number;
  readabilityScore: number;
  missingKeywords: string[];
  suggestions: { section: string; original: string; improved: string; note: string }[];
  computedAt: string;
}

export interface JobMatchReport {
  id: string;
  profileId: string;
  userId: string;
  jobId: string;
  matchScore: number;
  missingSkills: string[];
  strongAreas: string[];
  interviewProbability: number;
  atsRankingEstimate: number;
  computedAt: string;
}

export interface CareerInsight {
  id: string;
  profileId: string;
  userId: string;
  insightType: string;
  content: string;
  priority: number;
  read: boolean;
  createdAt: string;
}

export interface ApplicationAnalytics {
  id: string;
  profileId: string;
  userId: string;
  period: "daily" | "weekly" | "monthly";
  startDate: string;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
  totalRejected: number;
  conversionRate: number;
  interviewRate: number;
  offerRate: number;
  avgResponseTime: number;
  topDomains: { domain: string; count: number; successRate: number }[];
  topCompanies: { company: string; count: number; successRate: number }[];
  successTrend: { date: string; applied: number; success: number }[];
}

