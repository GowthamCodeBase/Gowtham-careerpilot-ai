import { LearningRoadmap } from "../db.ts";

export interface IRoadmapRepository {
  getRoadmaps(userId: string): Promise<LearningRoadmap[]>;
  createRoadmap(roadmap: Omit<LearningRoadmap, "id" | "createdAt" | "userId">, userId: string): Promise<LearningRoadmap>;
}
