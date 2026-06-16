import { IRoadmapRepository } from "../IRoadmapRepository.ts";
import { LearningRoadmap, db } from "../../db.ts";

export class JsonRoadmapRepository implements IRoadmapRepository {
  async getRoadmaps(userId: string): Promise<LearningRoadmap[]> {
    return db.getRoadmaps(userId);
  }

  async createRoadmap(roadmap: Omit<LearningRoadmap, "id" | "createdAt" | "userId">, userId: string): Promise<LearningRoadmap> {
    return db.createRoadmap(roadmap, userId);
  }
}
