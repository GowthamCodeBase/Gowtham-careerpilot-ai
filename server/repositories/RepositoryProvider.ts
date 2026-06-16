import { IUserRepository } from "./IUserRepository.ts";
import { IResumeRepository } from "./IResumeRepository.ts";
import { IJobRepository } from "./IJobRepository.ts";
import { IAIAnalysisRepository } from "./IAIAnalysisRepository.ts";
import { IRoadmapRepository } from "./IRoadmapRepository.ts";

import { JsonUserRepository } from "./json/JsonUserRepository.ts";
import { JsonResumeRepository } from "./json/JsonResumeRepository.ts";
import { JsonJobRepository } from "./json/JsonJobRepository.ts";
import { JsonAIAnalysisRepository } from "./json/JsonAIAnalysisRepository.ts";
import { JsonRoadmapRepository } from "./json/JsonRoadmapRepository.ts";

import { MysqlUserRepository } from "./mysql/MysqlUserRepository.ts";
import { MysqlResumeRepository } from "./mysql/MysqlResumeRepository.ts";
import { MysqlJobRepository } from "./mysql/MysqlJobRepository.ts";
import { MysqlAIAnalysisRepository } from "./mysql/MysqlAIAnalysisRepository.ts";
import { MysqlRoadmapRepository } from "./mysql/MysqlRoadmapRepository.ts";

class RepositoryProvider {
  private userRepo: IUserRepository;
  private resumeRepo: IResumeRepository;
  private jobRepo: IJobRepository;
  private aiAnalysisRepo: IAIAnalysisRepository;
  private roadmapRepo: IRoadmapRepository;

  constructor() {
    const provider = process.env.DATABASE_PROVIDER || "json";

    if (provider === "json") {
      this.userRepo = new JsonUserRepository();
      this.resumeRepo = new JsonResumeRepository();
      this.jobRepo = new JsonJobRepository();
      this.aiAnalysisRepo = new JsonAIAnalysisRepository();
      this.roadmapRepo = new JsonRoadmapRepository();
    } else if (provider === "mysql") {
      this.userRepo = new MysqlUserRepository();
      this.resumeRepo = new MysqlResumeRepository();
      this.jobRepo = new MysqlJobRepository();
      this.aiAnalysisRepo = new MysqlAIAnalysisRepository();
      this.roadmapRepo = new MysqlRoadmapRepository();
    } else {
      throw new Error(`Unsupported database provider: ${provider}. Only 'json' and 'mysql' are supported.`);
    }
  }

  getUserRepository(): IUserRepository {
    return this.userRepo;
  }

  getResumeRepository(): IResumeRepository {
    return this.resumeRepo;
  }

  getJobRepository(): IJobRepository {
    return this.jobRepo;
  }

  getAIAnalysisRepository(): IAIAnalysisRepository {
    return this.aiAnalysisRepo;
  }

  getRoadmapRepository(): IRoadmapRepository {
    return this.roadmapRepo;
  }
}

export const repos = new RepositoryProvider();
