import { db } from "../db.ts";
import { careerScoreService } from "./CareerScoreService.ts";

export class ForecastService {
  async forecast(userId: string): Promise<{
    interviewProbability: number;
    offerProbability: number;
    estimatedDaysToOffer: number;
    marketDemandScore: number;
    salaryExpectationRange: string;
    forecastJustification: string;
  }> {
    const scores = db.getHealthScores(userId);
    let healthScore = 70; // fallback default
    if (scores.length > 0) {
      healthScore = scores[scores.length - 1].overallScore;
    } else {
      const computed = await careerScoreService.computeHealthScore(userId);
      healthScore = computed.overallScore;
    }

    const apps = db.getApplications(userId);
    const successApps = apps.filter(a => a.status === "Interview" || a.status === "Offer");

    // Prediction heuristics
    let interviewProbability = Math.round(healthScore * 0.9);
    if (apps.length > 0) {
      const historicalSuccessRatio = successApps.length / apps.length;
      interviewProbability = Math.round(interviewProbability * 0.5 + historicalSuccessRatio * 50);
    }
    interviewProbability = Math.min(Math.max(interviewProbability, 10), 98);

    const offerProbability = Math.round(interviewProbability * 0.65);
    const estimatedDaysToOffer = Math.max(15, Math.round(60 - (healthScore / 2)));
    const marketDemandScore = Math.min(Math.round(healthScore * 0.95), 100);
    const salaryExpectationRange = "$135,000 - $175,000";

    const forecastJustification = `Based on your overall Career Health Score of ${healthScore}% and historical status transitions, you have a solid probability of landing callback events. Upskilling in critical tech gaps will reduce estimated job search time significantly.`;

    return {
      interviewProbability,
      offerProbability,
      estimatedDaysToOffer,
      marketDemandScore,
      salaryExpectationRange,
      forecastJustification
    };
  }
}

export const forecastService = new ForecastService();
