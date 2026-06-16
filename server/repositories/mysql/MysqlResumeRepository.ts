import { IResumeRepository } from "../IResumeRepository.ts";
import { Resume } from "../../db.ts";
import pool from "../../mysql.ts";
import crypto from "crypto";

export class MysqlResumeRepository implements IResumeRepository {
  async getResumes(userId: string): Promise<Resume[]> {
    const [rows] = await pool.execute("SELECT * FROM resumes WHERE userId = ? ORDER BY uploadedAt DESC", [userId]);
    return rows as Resume[];
  }

  async getResume(id: string, userId: string): Promise<Resume | undefined> {
    const [rows] = await pool.execute("SELECT * FROM resumes WHERE id = ? AND userId = ?", [id, userId]);
    const resumes = rows as Resume[];
    return resumes[0];
  }

  async createResume(resume: Omit<Resume, "id" | "uploadedAt" | "userId">, userId: string): Promise<Resume> {
    const newResume: Resume = {
      ...resume,
      id: "resume-" + crypto.randomUUID(),
      userId,
      uploadedAt: new Date().toISOString()
    };
    await pool.execute(
      "INSERT INTO resumes (id, userId, filename, parseText, fileSize, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)",
      [newResume.id, newResume.userId, newResume.filename, newResume.parseText, newResume.fileSize, newResume.uploadedAt]
    );
    return newResume;
  }

  async deleteResume(id: string, userId: string): Promise<boolean> {
    // Delete associated AI analyses first to maintain integrity
    await pool.execute("DELETE FROM aiAnalysis WHERE resumeId = ? AND userId = ?", [id, userId]);
    const [result] = await pool.execute("DELETE FROM resumes WHERE id = ? AND userId = ?", [id, userId]);
    const affected = (result as any).affectedRows;
    return affected > 0;
  }
}
