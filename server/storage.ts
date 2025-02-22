import { User, InsertUser, Message, Transaction } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, messages, transactions } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserMessages(userId: number): Promise<Message[]>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("[STORAGE] Error getting user:", error);
      throw new Error("Failed to get user");
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("[STORAGE] Error getting user by email:", error);
      throw new Error("Failed to get user by email");
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("[STORAGE] Creating user with email:", insertUser.email);
      const [user] = await db.insert(users).values(insertUser).returning();
      console.log("[STORAGE] User created successfully:", user.id);
      return user;
    } catch (error) {
      console.error("[STORAGE] Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    try {
      return await db.select().from(messages).where(eq(messages.senderId, userId));
    } catch (error) {
      console.error("[STORAGE] Error getting user messages:", error);
      throw new Error("Failed to get user messages");
    }
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions).where(eq(transactions.senderId, userId));
    } catch (error) {
      console.error("[STORAGE] Error getting user transactions:", error);
      throw new Error("Failed to get user transactions");
    }
  }
}

export const storage = new DatabaseStorage();