import { JobApplication } from "../db.ts";

export interface IJobRepository {
  getApplications(userId: string): Promise<JobApplication[]>;
  getApplication(id: string, userId: string): Promise<JobApplication | undefined>;
  createApplication(app: Omit<JobApplication, "id" | "createdAt" | "userId">, userId: string): Promise<JobApplication>;
  updateApplication(id: string, userId: string, updates: Partial<JobApplication>): Promise<JobApplication | null>;
  deleteApplication(id: string, userId: string): Promise<boolean>;
}
