import { IResumeRepository } from "../IResumeRepository.ts";
import { Resume, db } from "../../db.ts";

export class JsonResumeRepository implements IResumeRepository {
  async getResumes(userId: string): Promise<Resume[]> {
    return db.getResumes(userId);
  }

  async getResume(id: string, userId: string): Promise<Resume | undefined> {
    return db.getResume(id, userId);
  }

  async createResume(resume: Omit<Resume, "id" | "uploadedAt" | "userId">, userId: string): Promise<Resume> {
    return db.createResume(resume, userId);
  }

  async deleteResume(id: string, userId: string): Promise<boolean> {
    return db.deleteResume(id, userId);
  }
}
