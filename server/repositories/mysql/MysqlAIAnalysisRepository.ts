import { IAIAnalysisRepository } from "../IAIAnalysisRepository.ts";
import { AIAnalysis } from "../../db.ts";
import pool from "../../mysql.ts";
import crypto from "crypto";

export class MysqlAIAnalysisRepository implements IAIAnalysisRepository {
  async getAnalysisByResume(resumeId: string, userId: string): Promise<AIAnalysis | undefined> {
    const [rows] = await pool.execute("SELECT * FROM aiAnalysis WHERE resumeId = ? AND userId = ?", [resumeId, userId]);
    const results = rows as any[];
    if (results.length === 0) return undefined;

    const row = results[0];
    return {
      id: row.id,
      resumeId: row.resumeId,
      userId: row.userId,
      atsScore: row.atsScore,
      missingKeywords: JSON.parse(row.missingKeywords || "[]"),
      suggestions: JSON.parse(row.suggestions || "[]"),
      improvedBulletPoints: JSON.parse(row.improvedBulletPoints || "[]"),
      analyzedAt: row.analyzedAt
    };
  }

  async createAnalysis(analysis: Omit<AIAnalysis, "id" | "analyzedAt" | "userId">, userId: string): Promise<AIAnalysis> {
    // Delete existing analysis for this resume if any to avoid duplicates
    await pool.execute("DELETE FROM aiAnalysis WHERE resumeId = ? AND userId = ?", [analysis.resumeId, userId]);

    const newAnalysis: AIAnalysis = {
      ...analysis,
      id: "analysis-" + crypto.randomUUID(),
      userId,
      analyzedAt: new Date().toISOString()
    };

    await pool.execute(
      "INSERT INTO aiAnalysis (id, resumeId, userId, atsScore, missingKeywords, suggestions, improvedBulletPoints, analyzedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newAnalysis.id,
        newAnalysis.resumeId,
        newAnalysis.userId,
        newAnalysis.atsScore,
        JSON.stringify(newAnalysis.missingKeywords),
        JSON.stringify(newAnalysis.suggestions),
        JSON.stringify(newAnalysis.improvedBulletPoints),
        newAnalysis.analyzedAt
      ]
    );

    return newAnalysis;
  }
}
