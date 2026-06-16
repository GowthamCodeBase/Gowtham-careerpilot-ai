import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

const host = process.env.MYSQL_HOST || "localhost";
const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "";
const dbName = process.env.MYSQL_DATABASE || "careerpilot";

async function runMigration() {
  console.log("--------------------------------------------------");
  console.log("🚀 Starting Gowtham CareerPilot AI MySQL Migration");
  console.log(`📍 Connecting to MySQL at ${host}:${port} as ${user}`);
  console.log(`📂 DB File: ${DB_FILE_PATH}`);
  console.log("--------------------------------------------------");

  if (!fs.existsSync(DB_FILE_PATH)) {
    console.error("❌ ERROR: db.json file not found! Nothing to migrate.");
    process.exit(1);
  }

  let connection: mysql.Connection | null = null;
  try {
    // 1. Connect without database first
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    console.log("✓ Connected to MySQL server.");

    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✓ Database '${dbName}' verified/created.`);

    // 3. Switch to target database
    await connection.query(`USE \`${dbName}\``);

    // 4. Create Tables
    console.log("🛠️ Creating tables if they do not exist...");
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        createdAt VARCHAR(50) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        parseText LONGTEXT NOT NULL,
        fileSize VARCHAR(50) NOT NULL,
        uploadedAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        company VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        appliedDate VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        salary VARCHAR(50),
        location VARCHAR(100),
        jobDescription TEXT,
        notes TEXT,
        createdAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS aiAnalysis (
        id VARCHAR(50) PRIMARY KEY,
        resumeId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        atsScore INT NOT NULL,
        missingKeywords TEXT NOT NULL,
        suggestions TEXT NOT NULL,
        improvedBulletPoints TEXT NOT NULL,
        analyzedAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS roadmaps (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        currentSkills TEXT NOT NULL,
        targetRole VARCHAR(100) NOT NULL,
        roadmapSteps LONGTEXT NOT NULL,
        createdAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("✓ Database schemas verified successfully.");

    // 5. Parse db.json
    console.log("📦 Ingesting data from db.json...");
    const rawData = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const dbData = JSON.parse(rawData);

    // 6. Migrate Users
    let usersCount = 0;
    if (dbData.users && Array.isArray(dbData.users)) {
      for (const u of dbData.users) {
        // Check if user already exists
        const [rows] = await connection.query("SELECT id FROM users WHERE id = ?", [u.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO users (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)",
            [u.id, u.name, u.email, u.passwordHash, u.createdAt]
          );
          usersCount++;
        }
      }
    }
    console.log(`✓ Migrated ${usersCount} users.`);

    // 7. Migrate Resumes
    let resumesCount = 0;
    if (dbData.resumes && Array.isArray(dbData.resumes)) {
      for (const r of dbData.resumes) {
        const [rows] = await connection.query("SELECT id FROM resumes WHERE id = ?", [r.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO resumes (id, userId, filename, parseText, fileSize, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)",
            [r.id, r.userId, r.filename, r.parseText, r.fileSize, r.uploadedAt]
          );
          resumesCount++;
        }
      }
    }
    console.log(`✓ Migrated ${resumesCount} resumes.`);

    // 8. Migrate Applications
    let appsCount = 0;
    if (dbData.applications && Array.isArray(dbData.applications)) {
      for (const app of dbData.applications) {
        const [rows] = await connection.query("SELECT id FROM applications WHERE id = ?", [app.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO applications (id, userId, company, role, appliedDate, status, salary, location, jobDescription, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              app.id,
              app.userId,
              app.company,
              app.role,
              app.appliedDate,
              app.status,
              app.salary || null,
              app.location || null,
              app.jobDescription || null,
              app.notes || null,
              app.createdAt
            ]
          );
          appsCount++;
        }
      }
    }
    console.log(`✓ Migrated ${appsCount} job applications.`);

    // 9. Migrate AI Analyses
    let analysisCount = 0;
    if (dbData.aiAnalysis && Array.isArray(dbData.aiAnalysis)) {
      for (const a of dbData.aiAnalysis) {
        const [rows] = await connection.query("SELECT id FROM aiAnalysis WHERE id = ?", [a.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO aiAnalysis (id, resumeId, userId, atsScore, missingKeywords, suggestions, improvedBulletPoints, analyzedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              a.id,
              a.resumeId,
              a.userId,
              a.atsScore,
              JSON.stringify(a.missingKeywords),
              JSON.stringify(a.suggestions),
              JSON.stringify(a.improvedBulletPoints),
              a.analyzedAt
            ]
          );
          analysisCount++;
        }
      }
    }
    console.log(`✓ Migrated ${analysisCount} AI analysis reports.`);

    // 10. Migrate Roadmaps
    let roadmapsCount = 0;
    if (dbData.roadmaps && Array.isArray(dbData.roadmaps)) {
      for (const rm of dbData.roadmaps) {
        const [rows] = await connection.query("SELECT id FROM roadmaps WHERE id = ?", [rm.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO roadmaps (id, userId, currentSkills, targetRole, roadmapSteps, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            [
              rm.id,
              rm.userId,
              JSON.stringify(rm.currentSkills),
              rm.targetRole,
              JSON.stringify(rm.roadmapSteps),
              rm.createdAt
            ]
          );
          roadmapsCount++;
        }
      }
    }
    console.log(`✓ Migrated ${roadmapsCount} learning roadmaps.`);

    console.log("--------------------------------------------------");
    console.log("🎉 SUCCESS: MySQL migration has completed successfully!");
    console.log(`📊 Total Imported Records: ${usersCount + resumesCount + appsCount + analysisCount + roadmapsCount}`);
    console.log("--------------------------------------------------");

  } catch (error) {
    console.error("❌ ERROR: Migration failed!", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
