import { Resume } from "../db.ts";

export interface IResumeRepository {
  getResumes(userId: string): Promise<Resume[]>;
  getResume(id: string, userId: string): Promise<Resume | undefined>;
  createResume(resume: Omit<Resume, "id" | "uploadedAt" | "userId">, userId: string): Promise<Resume>;
  deleteResume(id: string, userId: string): Promise<boolean>;
}
