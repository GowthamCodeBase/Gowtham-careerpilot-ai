import { IUserRepository } from "../IUserRepository.ts";
import { User, db } from "../../db.ts";

export class JsonUserRepository implements IUserRepository {
  async getUserById(id: string): Promise<User | undefined> {
    return db.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.getUserByEmail(email);
  }

  async createUser(user: User): Promise<User> {
    return db.createUser(user);
  }
}
