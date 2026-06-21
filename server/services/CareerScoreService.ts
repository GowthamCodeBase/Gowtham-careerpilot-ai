import { db, CareerHealthScore } from "../db.ts";

export class CareerScoreService {
  async computeHealthScore(userId: string): Promise<CareerHealthScore> {
    const profile = db.getCareerProfile(userId);
    const resumes = db.getResumes(userId);
    const roadmaps = db.getRoadmaps(userId);
    const apps = db.getApplications(userId);

    // 1. Resume Score (25%)
    let resumeScore = 50; // default
    if (resumes.length > 0) {
      const latestResume = resumes[resumes.length - 1];
      const analysis = db.getAnalysisByResume(latestResume.id, userId);
      const intel = db.getResumeIntelligenceByResume(latestResume.id, userId);
      if (intel) {
        resumeScore = intel.atsScore;
      } else if (analysis) {
        resumeScore = analysis.atsScore;
      } else {
        resumeScore = 70; // baseline parsed resume
      }
    }

    // 2. Skill Score (20%)
    let skillScore = 50; // default
    const skillAnalysis = db.getSkillAnalysis(userId);
    if (skillAnalysis) {
      const reqCount = skillAnalysis.requiredSkills.length;
      const existCount = skillAnalysis.existingSkills.length;
      if (reqCount > 0) {
        const intersection = skillAnalysis.existingSkills.filter(s => s.match).length;
        skillScore = Math.round((intersection / reqCount) * 100);
      } else {
        skillScore = 80;
      }
    } else if (profile && profile.skills.length > 0) {
      skillScore = Math.min(60 + profile.skills.length * 4, 95);
    }

    // 3. Application Score (20%)
    let applicationScore = 30; // base score for starting
    if (apps.length >= 5) {
      applicationScore = 95;
    } else if (apps.length >= 3) {
      applicationScore = 80;
    } else if (apps.length >= 1) {
      applicationScore = 60;
    }

    // 4. Interview/Status Score (15%)
    let interviewScore = 50; // default
    const hasOffer = apps.some(a => a.status === "Offer");
    const hasInterview = apps.some(a => a.status === "Interview");
    const hasAppliedOnly = apps.every(a => a.status === "Applied");
    if (hasOffer) {
      interviewScore = 100;
    } else if (hasInterview) {
      interviewScore = 85;
    } else if (apps.length > 0 && hasAppliedOnly) {
      interviewScore = 70;
    } else if (apps.length > 0) {
      interviewScore = 60; // balance of rejections/etc
    }

    // 5. Roadmap Progress Score (20%)
    let roadmapScore = 40; // baseline
    if (roadmaps.length > 0) {
      // For demo, assume step progress is partially finished
      roadmapScore = 75;
    }

    // Calculate Overall Score
    const overallScore = Math.round(
      resumeScore * 0.25 +
      skillScore * 0.20 +
      applicationScore * 0.20 +
      interviewScore * 0.15 +
      roadmapScore * 0.20
    );

    const profileId = profile?.id || "profile-none";

    const score = db.createHealthScore({
      profileId,
      overallScore,
      resumeScore,
      skillScore,
      applicationScore,
      interviewScore,
      roadmapScore
    }, userId);

    return score;
  }
}

export const careerScoreService = new CareerScoreService();
