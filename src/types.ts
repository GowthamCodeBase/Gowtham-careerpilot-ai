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
