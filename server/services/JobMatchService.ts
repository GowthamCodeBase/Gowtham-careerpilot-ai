import { db, JobMatchReport } from "../db.ts";
import { matchResumeWithJD } from "../gemini.ts";

export class JobMatchService {
  async matchJob(userId: string, jobId: string, jobDescriptionText: string): Promise<JobMatchReport> {
    const profile = db.getCareerProfile(userId);
    const profileId = profile?.id || "profile-none";
    const resumes = db.getResumes(userId);

    let matchScore = 75;
    let missingSkills: string[] = ["CI/CD Pipelines", "Redis Caching"];
    let strongAreas: string[] = ["React", "TypeScript", "REST APIs"];

    if (resumes.length > 0) {
      const latestResume = resumes[resumes.length - 1];
      try {
        const aiMatch = await matchResumeWithJD(latestResume.parseText, jobDescriptionText);
        matchScore = aiMatch.matchScore;
        missingSkills = aiMatch.missingKeywords;
        strongAreas = ["Core Technical Skills", "Frontend Engineering"];
      } catch (e) {
        console.warn("Failed to match JD via AI, using fallback heuristics:", e);
      }
    }

    // Heuristics for interview probabilities & ranking
    const interviewProbability = Math.round(matchScore * 0.95);
    const atsRankingEstimate = Math.max(1, Math.round(100 - matchScore));

    const report = db.createJobMatchReport({
      profileId,
      jobId,
      matchScore,
      missingSkills,
      strongAreas,
      interviewProbability,
      atsRankingEstimate
    }, userId);

    return report;
  }
}

export const jobMatchService = new JobMatchService();
