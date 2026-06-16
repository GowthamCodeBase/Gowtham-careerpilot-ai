import { IJobRepository } from "../IJobRepository.ts";
import { JobApplication } from "../../db.ts";
import pool from "../../mysql.ts";
import crypto from "crypto";

export class MysqlJobRepository implements IJobRepository {
  async getApplications(userId: string): Promise<JobApplication[]> {
    const [rows] = await pool.execute("SELECT * FROM applications WHERE userId = ? ORDER BY appliedDate DESC", [userId]);
    return rows as JobApplication[];
  }

  async getApplication(id: string, userId: string): Promise<JobApplication | undefined> {
    const [rows] = await pool.execute("SELECT * FROM applications WHERE id = ? AND userId = ?", [id, userId]);
    const apps = rows as JobApplication[];
    return apps[0];
  }

  async createApplication(app: Omit<JobApplication, "id" | "createdAt" | "userId">, userId: string): Promise<JobApplication> {
    const newApp: JobApplication = {
      ...app,
      id: "app-" + crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString()
    };
    await pool.execute(
      "INSERT INTO applications (id, userId, company, role, appliedDate, status, salary, location, jobDescription, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newApp.id,
        newApp.userId,
        newApp.company,
        newApp.role,
        newApp.appliedDate,
        newApp.status,
        newApp.salary || null,
        newApp.location || null,
        newApp.jobDescription || null,
        newApp.notes || null,
        newApp.createdAt
      ]
    );
    return newApp;
  }

  async updateApplication(id: string, userId: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
    const existing = await this.getApplication(id, userId);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    await pool.execute(
      "UPDATE applications SET company = ?, role = ?, appliedDate = ?, status = ?, salary = ?, location = ?, jobDescription = ?, notes = ? WHERE id = ? AND userId = ?",
      [
        merged.company,
        merged.role,
        merged.appliedDate,
        merged.status,
        merged.salary || null,
        merged.location || null,
        merged.jobDescription || null,
        merged.notes || null,
        id,
        userId
      ]
    );
    return merged;
  }

  async deleteApplication(id: string, userId: string): Promise<boolean> {
    const [result] = await pool.execute("DELETE FROM applications WHERE id = ? AND userId = ?", [id, userId]);
    const affected = (result as any).affectedRows;
    return affected > 0;
  }
}
