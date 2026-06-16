import { IAIAnalysisRepository } from "../IAIAnalysisRepository.ts";
import { AIAnalysis, db } from "../../db.ts";

export class JsonAIAnalysisRepository implements IAIAnalysisRepository {
  async getAnalysisByResume(resumeId: string, userId: string): Promise<AIAnalysis | undefined> {
    return db.getAnalysisByResume(resumeId, userId);
  }

  async createAnalysis(analysis: Omit<AIAnalysis, "id" | "analyzedAt" | "userId">, userId: string): Promise<AIAnalysis> {
    return db.createAnalysis(analysis, userId);
  }
}
