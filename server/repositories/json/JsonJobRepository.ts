import { IJobRepository } from "../IJobRepository.ts";
import { JobApplication, db } from "../../db.ts";

export class JsonJobRepository implements IJobRepository {
  async getApplications(userId: string): Promise<JobApplication[]> {
    return db.getApplications(userId);
  }

  async getApplication(id: string, userId: string): Promise<JobApplication | undefined> {
    return db.getApplication(id, userId);
  }

  async createApplication(app: Omit<JobApplication, "id" | "createdAt" | "userId">, userId: string): Promise<JobApplication> {
    return db.createApplication(app, userId);
  }

  async updateApplication(id: string, userId: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
    return db.updateApplication(id, userId, updates);
  }

  async deleteApplication(id: string, userId: string): Promise<boolean> {
    return db.deleteApplication(id, userId);
  }
}
