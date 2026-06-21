import { db, SkillAnalysis, CareerProfile } from "../db.ts";

export class SkillGapService {
  private getRequiredSkillsForRole(role: string): { name: string; importance: string; typicalLevel: string }[] {
    const lowercaseRole = role.toLowerCase();
    
    if (lowercaseRole.includes("frontend") || lowercaseRole.includes("ui")) {
      return [
        { name: "React", importance: "High", typicalLevel: "Expert" },
        { name: "TypeScript", importance: "High", typicalLevel: "Advanced" },
        { name: "Tailwind CSS", importance: "Medium", typicalLevel: "Advanced" },
        { name: "Next.js", importance: "High", typicalLevel: "Intermediate" },
        { name: "Jest / Cypress", importance: "Medium", typicalLevel: "Intermediate" },
        { name: "Web Performance", importance: "High", typicalLevel: "Advanced" },
        { name: "Webpack / Vite", importance: "Medium", typicalLevel: "Intermediate" },
        { name: "State Management (Redux/Zustand)", importance: "Medium", typicalLevel: "Advanced" }
      ];
    } else if (lowercaseRole.includes("backend") || lowercaseRole.includes("api") || lowercaseRole.includes("system")) {
      return [
        { name: "Node.js", importance: "High", typicalLevel: "Expert" },
        { name: "Express / NestJS", importance: "High", typicalLevel: "Expert" },
        { name: "TypeScript", importance: "High", typicalLevel: "Advanced" },
        { name: "SQL / PostgreSQL", importance: "High", typicalLevel: "Advanced" },
        { name: "Redis Caching", importance: "High", typicalLevel: "Intermediate" },
        { name: "Docker", importance: "Medium", typicalLevel: "Intermediate" },
        { name: "AWS Cloud Services", importance: "Medium", typicalLevel: "Intermediate" },
        { name: "CI/CD Pipelines", importance: "Medium", typicalLevel: "Intermediate" }
      ];
    }

    // Default Full Stack / Software Engineer role skills
    return [
      { name: "React", importance: "High", typicalLevel: "Advanced" },
      { name: "TypeScript", importance: "High", typicalLevel: "Advanced" },
      { name: "Node.js", importance: "High", typicalLevel: "Advanced" },
      { name: "Express", importance: "High", typicalLevel: "Advanced" },
      { name: "SQL / MySQL", importance: "High", typicalLevel: "Intermediate" },
      { name: "Git & Version Control", importance: "High", typicalLevel: "Advanced" },
      { name: "Docker Platforms", importance: "Medium", typicalLevel: "Intermediate" },
      { name: "AWS Cloud Infrastructure", importance: "Medium", typicalLevel: "Intermediate" }
    ];
  }

  async analyzeSkillGap(userId: string, targetRole?: string): Promise<SkillAnalysis> {
    let profile = db.getCareerProfile(userId);
    if (!profile) {
      // Create a default baseline career profile
      profile = db.upsertCareerProfile({
        currentRole: "Software Engineer",
        targetRole: targetRole || "Senior Full Stack Architect",
        industry: "Information Technology",
        yearsExperience: 3,
        location: "San Francisco, CA",
        skills: [
          { name: "React", level: "Advanced", years: 3 },
          { name: "TypeScript", level: "Intermediate", years: 2 },
          { name: "Node.js", level: "Intermediate", years: 2 },
          { name: "SQL", level: "Intermediate", years: 2 }
        ],
        education: [
          { degree: "B.S. in Computer Science", institution: "Tech State University", year: 2022 }
        ],
        certifications: []
      }, userId);
    }

    const roleToAnalyze = targetRole || profile.targetRole;
    const required = this.getRequiredSkillsForRole(roleToAnalyze);
    
    const existingSkills = required.map(req => {
      const match = profile!.skills.some(es => es.name.toLowerCase().includes(req.name.toLowerCase()));
      return {
        name: req.name,
        currentLevel: match ? "Advanced" : "None",
        match
      };
    });

    const missingSkills = required
      .filter(req => !profile!.skills.some(es => es.name.toLowerCase().includes(req.name.toLowerCase())))
      .map(req => {
        const priority: "High" | "Medium" | "Low" = req.importance === "High" ? "High" : "Medium";
        return {
          name: req.name,
          priority,
          learningTimeline: priority === "High" ? "1-2 Weeks" : "3-4 Weeks"
        };
      });

    const certifications = roleToAnalyze.toLowerCase().includes("backend")
      ? ["AWS Certified Solutions Architect", "Docker Certified Associate"]
      : ["Meta Front-End Developer Certificate", "AWS Certified Developer"];

    const analysis = db.createSkillAnalysis({
      profileId: profile.id,
      targetRole: roleToAnalyze,
      requiredSkills: required,
      existingSkills,
      missingSkills,
      certifications
    }, userId);

    return analysis;
  }
}

export const skillGapService = new SkillGapService();
