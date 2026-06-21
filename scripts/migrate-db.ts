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
  console.log("🚀 Starting Gowtham Career Pilot AI MySQL Migration");
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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS career_profiles (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        currentRole VARCHAR(255) NOT NULL,
        targetRole VARCHAR(255) NOT NULL,
        industry VARCHAR(255) NOT NULL,
        yearsExperience INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        skills TEXT NOT NULL,
        education TEXT NOT NULL,
        certifications TEXT NOT NULL,
        createdAt VARCHAR(50) NOT NULL,
        updatedAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS skill_analysis (
        id VARCHAR(50) PRIMARY KEY,
        profileId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        targetRole VARCHAR(255) NOT NULL,
        requiredSkills TEXT NOT NULL,
        existingSkills TEXT NOT NULL,
        missingSkills TEXT NOT NULL,
        certifications TEXT NOT NULL,
        computedAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (profileId) REFERENCES career_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS career_health_scores (
        id VARCHAR(50) PRIMARY KEY,
        profileId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        overallScore DECIMAL(5,2) NOT NULL,
        resumeScore DECIMAL(5,2) NOT NULL,
        skillScore DECIMAL(5,2) NOT NULL,
        applicationScore DECIMAL(5,2) NOT NULL,
        interviewScore DECIMAL(5,2) NOT NULL,
        roadmapScore DECIMAL(5,2) NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        FOREIGN KEY (profileId) REFERENCES career_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS resume_intelligence (
        id VARCHAR(50) PRIMARY KEY,
        resumeId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        atsScore DECIMAL(5,2) NOT NULL,
        keywordCoverage DECIMAL(5,2) NOT NULL,
        impactScore DECIMAL(5,2) NOT NULL,
        achievementDensity DECIMAL(5,2) NOT NULL,
        actionVerbDensity DECIMAL(5,2) NOT NULL,
        readabilityScore DECIMAL(5,2) NOT NULL,
        missingKeywords TEXT NOT NULL,
        suggestions TEXT NOT NULL,
        computedAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_match_reports (
        id VARCHAR(50) PRIMARY KEY,
        profileId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        jobId VARCHAR(50) NOT NULL,
        matchScore DECIMAL(5,2) NOT NULL,
        missingSkills TEXT NOT NULL,
        strongAreas TEXT NOT NULL,
        interviewProbability DECIMAL(5,2) NOT NULL,
        atsRankingEstimate DECIMAL(5,2) NOT NULL,
        computedAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (profileId) REFERENCES career_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS career_insights (
        id VARCHAR(50) PRIMARY KEY,
        profileId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        insightType VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        priority INT NOT NULL,
        \`read\` BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (profileId) REFERENCES career_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS application_analytics (
        id VARCHAR(50) PRIMARY KEY,
        profileId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        period VARCHAR(50) NOT NULL,
        startDate VARCHAR(50) NOT NULL,
        totalApplied INT NOT NULL,
        totalInterviews INT NOT NULL,
        totalOffers INT NOT NULL,
        totalRejected INT NOT NULL,
        conversionRate DECIMAL(5,2) NOT NULL,
        interviewRate DECIMAL(5,2) NOT NULL,
        offerRate DECIMAL(5,2) NOT NULL,
        avgResponseTime DECIMAL(8,2) NOT NULL,
        topDomains TEXT NOT NULL,
        topCompanies TEXT NOT NULL,
        successTrend TEXT NOT NULL,
        FOREIGN KEY (profileId) REFERENCES career_profiles(id) ON DELETE CASCADE,
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

    // 11. Migrate Career Profiles
    let profilesCount = 0;
    if (dbData.careerProfiles && Array.isArray(dbData.careerProfiles)) {
      for (const cp of dbData.careerProfiles) {
        const [rows] = await connection.query("SELECT id FROM career_profiles WHERE id = ?", [cp.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO career_profiles (id, userId, currentRole, targetRole, industry, yearsExperience, location, skills, education, certifications, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              cp.id,
              cp.userId,
              cp.currentRole,
              cp.targetRole,
              cp.industry,
              cp.yearsExperience,
              cp.location,
              JSON.stringify(cp.skills),
              JSON.stringify(cp.education),
              JSON.stringify(cp.certifications),
              cp.createdAt,
              cp.updatedAt
            ]
          );
          profilesCount++;
        }
      }
    }
    console.log(`✓ Migrated ${profilesCount} career profiles.`);

    // 12. Migrate Skill Analysis
    let skillAnalysisCount = 0;
    if (dbData.skillAnalysis && Array.isArray(dbData.skillAnalysis)) {
      for (const sa of dbData.skillAnalysis) {
        const [rows] = await connection.query("SELECT id FROM skill_analysis WHERE id = ?", [sa.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO skill_analysis (id, profileId, userId, targetRole, requiredSkills, existingSkills, missingSkills, certifications, computedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              sa.id,
              sa.profileId,
              sa.userId,
              sa.targetRole,
              JSON.stringify(sa.requiredSkills),
              JSON.stringify(sa.existingSkills),
              JSON.stringify(sa.missingSkills),
              JSON.stringify(sa.certifications),
              sa.computedAt
            ]
          );
          skillAnalysisCount++;
        }
      }
    }
    console.log(`✓ Migrated ${skillAnalysisCount} skill analysis reports.`);

    // 13. Migrate Career Health Scores
    let scoresCount = 0;
    if (dbData.careerHealthScores && Array.isArray(dbData.careerHealthScores)) {
      for (const hs of dbData.careerHealthScores) {
        const [rows] = await connection.query("SELECT id FROM career_health_scores WHERE id = ?", [hs.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO career_health_scores (id, profileId, userId, overallScore, resumeScore, skillScore, applicationScore, interviewScore, roadmapScore, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              hs.id,
              hs.profileId,
              hs.userId,
              hs.overallScore,
              hs.resumeScore,
              hs.skillScore,
              hs.applicationScore,
              hs.interviewScore,
              hs.roadmapScore,
              hs.timestamp
            ]
          );
          scoresCount++;
        }
      }
    }
    console.log(`✓ Migrated ${scoresCount} career health score records.`);

    // 14. Migrate Resume Intelligence
    let intelCount = 0;
    if (dbData.resumeIntelligence && Array.isArray(dbData.resumeIntelligence)) {
      for (const ri of dbData.resumeIntelligence) {
        const [rows] = await connection.query("SELECT id FROM resume_intelligence WHERE id = ?", [ri.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO resume_intelligence (id, resumeId, userId, atsScore, keywordCoverage, impactScore, achievementDensity, actionVerbDensity, readabilityScore, missingKeywords, suggestions, computedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              ri.id,
              ri.resumeId,
              ri.userId,
              ri.atsScore,
              ri.keywordCoverage,
              ri.impactScore,
              ri.achievementDensity,
              ri.actionVerbDensity,
              ri.readabilityScore,
              JSON.stringify(ri.missingKeywords),
              JSON.stringify(ri.suggestions),
              ri.computedAt
            ]
          );
          intelCount++;
        }
      }
    }
    console.log(`✓ Migrated ${intelCount} resume intelligence reports.`);

    // 15. Migrate Job Match Reports
    let matchesCount = 0;
    if (dbData.jobMatchReports && Array.isArray(dbData.jobMatchReports)) {
      for (const jm of dbData.jobMatchReports) {
        const [rows] = await connection.query("SELECT id FROM job_match_reports WHERE id = ?", [jm.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO job_match_reports (id, profileId, userId, jobId, matchScore, missingSkills, strongAreas, interviewProbability, atsRankingEstimate, computedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              jm.id,
              jm.profileId,
              jm.userId,
              jm.jobId,
              jm.matchScore,
              JSON.stringify(jm.missingSkills),
              JSON.stringify(jm.strongAreas),
              jm.interviewProbability,
              jm.atsRankingEstimate,
              jm.computedAt
            ]
          );
          matchesCount++;
        }
      }
    }
    console.log(`✓ Migrated ${matchesCount} job match reports.`);

    // 16. Migrate Career Insights
    let insightsCount = 0;
    if (dbData.careerInsights && Array.isArray(dbData.careerInsights)) {
      for (const ci of dbData.careerInsights) {
        const [rows] = await connection.query("SELECT id FROM career_insights WHERE id = ?", [ci.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO career_insights (id, profileId, userId, insightType, content, priority, `read`, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              ci.id,
              ci.profileId,
              ci.userId,
              ci.insightType,
              ci.content,
              ci.priority,
              ci.read ? 1 : 0,
              ci.createdAt
            ]
          );
          insightsCount++;
        }
      }
    }
    console.log(`✓ Migrated ${insightsCount} career insights.`);

    // 17. Migrate Application Analytics
    let analyticsCount = 0;
    if (dbData.applicationAnalytics && Array.isArray(dbData.applicationAnalytics)) {
      for (const aa of dbData.applicationAnalytics) {
        const [rows] = await connection.query("SELECT id FROM application_analytics WHERE id = ?", [aa.id]);
        if ((rows as any[]).length === 0) {
          await connection.query(
            "INSERT INTO application_analytics (id, profileId, userId, period, startDate, totalApplied, totalInterviews, totalOffers, totalRejected, conversionRate, interviewRate, offerRate, avgResponseTime, topDomains, topCompanies, successTrend) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              aa.id,
              aa.profileId,
              aa.userId,
              aa.period,
              aa.startDate,
              aa.totalApplied,
              aa.totalInterviews,
              aa.totalOffers,
              aa.totalRejected,
              aa.conversionRate,
              aa.interviewRate,
              aa.offerRate,
              aa.avgResponseTime,
              JSON.stringify(aa.topDomains),
              JSON.stringify(aa.topCompanies),
              JSON.stringify(aa.successTrend)
            ]
          );
          analyticsCount++;
        }
      }
    }
    console.log(`✓ Migrated ${analyticsCount} application analytics reports.`);

    console.log("--------------------------------------------------");
    console.log("🎉 SUCCESS: MySQL migration has completed successfully!");
    console.log(`📊 Total Imported Records: ${usersCount + resumesCount + appsCount + analysisCount + roadmapsCount + profilesCount + skillAnalysisCount + scoresCount + intelCount + matchesCount + insightsCount + analyticsCount}`);
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
