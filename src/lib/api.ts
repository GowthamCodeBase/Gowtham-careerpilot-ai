const API_BASE = "";

// Helper to get authorization headers
function getHeaders(): HeadersInit {
  const token = localStorage.getItem("career_pilot_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth Api Calls
  setToken(token: string) {
    localStorage.setItem("career_pilot_token", token);
  },
  
  getToken() {
    return localStorage.getItem("career_pilot_token");
  },
  
  logout() {
    localStorage.removeItem("career_pilot_token");
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  async login(body: any) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Authentication failed.");
    }
    return res.json();
  },

  async register(body: any) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Registration failed.");
    }
    return res.json();
  },

  // Job Applications CRUD API
  async getApplications() {
    const res = await fetch(`${API_BASE}/api/applications`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load applications.");
    return res.json();
  },

  async createApplication(data: any) {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to store tracking details.");
    return res.json();
  },

  async updateApplication(id: string, data: any) {
    const res = await fetch(`${API_BASE}/api/applications/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update application.");
    return res.json();
  },

  async deleteApplication(id: string) {
    const res = await fetch(`${API_BASE}/api/applications/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete application record.");
    return res.json();
  },

  // Resumes
  async getResumes() {
    const res = await fetch(`${API_BASE}/api/resumes`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load resume database.");
    return res.json();
  },

  async createResume(data: any) {
    const res = await fetch(`${API_BASE}/api/resumes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to parse/upload resume draft.");
    return res.json();
  },

  async deleteResume(id: string) {
    const res = await fetch(`${API_BASE}/api/resumes/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete resume file.");
    return res.json();
  },

  // AI Analysis
  async analyzeResume(resumeId: string) {
    const res = await fetch(`${API_BASE}/api/resumes/${resumeId}/analyze`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to analyze resume.");
    }
    return res.json();
  },

  async getResumeAnalysis(resumeId: string) {
    const res = await fetch(`${API_BASE}/api/resumes/${resumeId}/analysis`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Ready to analyze. Run analysis now.");
    return res.json();
  },

  // Roadmaps
  async getRoadmaps() {
    const res = await fetch(`${API_BASE}/api/career/roadmaps`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch roadmaps.");
    return res.json();
  },

  async createRoadmap(data: { currentSkills: string[]; targetRole: string }) {
    const res = await fetch(`${API_BASE}/api/career/roadmap`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to synthesize learning roadmap.");
    }
    return res.json();
  },

  // Analytics
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/api/analytics/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to compile dashboard metrics.");
    return res.json();
  },

  async getAIInsights() {
    const res = await fetch(`${API_BASE}/api/analytics/insights`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to analyze trends database via AI.");
    return res.json();
  },

  // API v2 Calls
  async getCareerProfile() {
    const res = await fetch(`${API_BASE}/api/v2/profiles`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load career profile.");
    return res.json();
  },

  async updateCareerProfile(data: any) {
    const res = await fetch(`${API_BASE}/api/v2/profiles`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update career profile.");
    return res.json();
  },

  async getCareerHealthScore() {
    const res = await fetch(`${API_BASE}/api/v2/health-score`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch health score.");
    return res.json();
  },

  async getResumeIntelligence(id: string) {
    const res = await fetch(`${API_BASE}/api/v2/resume-intelligence/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load resume intelligence report.");
    return res.json();
  },

  async getSkillGap() {
    const res = await fetch(`${API_BASE}/api/v2/skill-gap`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load skill gap analysis.");
    return res.json();
  },

  async matchJob(jobId: string, jobDescription: string) {
    const res = await fetch(`${API_BASE}/api/v2/job-match`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ jobId, jobDescription })
    });
    if (!res.ok) throw new Error("Failed to match job description.");
    return res.json();
  },

  async getApplicationAnalytics() {
    const res = await fetch(`${API_BASE}/api/v2/application-analytics`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load application analytics.");
    return res.json();
  },

  async getForecast() {
    const res = await fetch(`${API_BASE}/api/v2/forecast`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load predictive forecast.");
    return res.json();
  }
};

