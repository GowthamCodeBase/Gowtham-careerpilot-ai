import { IUserRepository } from "../IUserRepository.ts";
import { User } from "../../db.ts";
import pool from "../../mysql.ts";

export class MysqlUserRepository implements IUserRepository {
  async getUserById(id: string): Promise<User | undefined> {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    const users = rows as any[];
    return users[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    const users = rows as any[];
    return users[0];
  }

  async createUser(user: User): Promise<User> {
    await pool.execute(
      "INSERT INTO users (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)",
      [user.id, user.name, user.email, user.passwordHash, user.createdAt]
    );
    return user;
  }
}
