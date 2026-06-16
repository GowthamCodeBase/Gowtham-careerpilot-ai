import { AIAnalysis } from "../db.ts";

export interface IAIAnalysisRepository {
  getAnalysisByResume(resumeId: string, userId: string): Promise<AIAnalysis | undefined>;
  createAnalysis(analysis: Omit<AIAnalysis, "id" | "analyzedAt" | "userId">, userId: string): Promise<AIAnalysis>;
}
