import { IRoadmapRepository } from "../IRoadmapRepository.ts";
import { LearningRoadmap } from "../../db.ts";
import pool from "../../mysql.ts";
import crypto from "crypto";

export class MysqlRoadmapRepository implements IRoadmapRepository {
  async getRoadmaps(userId: string): Promise<LearningRoadmap[]> {
    const [rows] = await pool.execute("SELECT * FROM roadmaps WHERE userId = ? ORDER BY createdAt DESC", [userId]);
    const results = rows as any[];
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      currentSkills: JSON.parse(row.currentSkills || "[]"),
      targetRole: row.targetRole,
      roadmapSteps: JSON.parse(row.roadmapSteps || "[]"),
      createdAt: row.createdAt
    }));
  }

  async createRoadmap(roadmap: Omit<LearningRoadmap, "id" | "createdAt" | "userId">, userId: string): Promise<LearningRoadmap> {
    const newRoadmap: LearningRoadmap = {
      ...roadmap,
      id: "roadmap-" + crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString()
    };

    await pool.execute(
      "INSERT INTO roadmaps (id, userId, currentSkills, targetRole, roadmapSteps, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [
        newRoadmap.id,
        newRoadmap.userId,
        JSON.stringify(newRoadmap.currentSkills),
        newRoadmap.targetRole,
        JSON.stringify(newRoadmap.roadmapSteps),
        newRoadmap.createdAt
      ]
    );

    return newRoadmap;
  }
}
