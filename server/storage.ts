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
    console.log("[STORAGE] Initializing DatabaseStorage");
    try {
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true,
      });
      console.log("[STORAGE] Session store initialized successfully");
    } catch (error) {
      console.error("[STORAGE] Failed to initialize session store:", error);
      throw new Error("Failed to initialize session store");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log("[STORAGE] Getting user by ID:", id);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log("[STORAGE] User retrieval result:", user ? "Found" : "Not found");
      return user;
    } catch (error) {
      console.error("[STORAGE] Error getting user:", error);
      if (error instanceof Error) {
        console.error("[STORAGE] Error stack:", error.stack);
      }
      throw new Error("Failed to get user");
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log("[STORAGE] Getting user by email:", email);
      const [user] = await db.select().from(users).where(eq(users.email, email));
      console.log("[STORAGE] User lookup result:", user ? "Found" : "Not found");
      return user;
    } catch (error) {
      console.error("[STORAGE] Error getting user by email:", error);
      if (error instanceof Error) {
        console.error("[STORAGE] Error stack:", error.stack);
      }
      throw new Error("Failed to get user by email");
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("[STORAGE] Creating user with email:", insertUser.email);
      const [user] = await db.insert(users).values(insertUser).returning();
      console.log("[STORAGE] User created successfully:", { id: user.id, email: user.email });
      return user;
    } catch (error) {
      console.error("[STORAGE] Error creating user:", error);
      if (error instanceof Error) {
        console.error("[STORAGE] Error stack:", error.stack);
      }
      // Check for unique constraint violation
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new Error("Email already exists");
      }
      throw new Error("Failed to create user");
    }
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    try {
      console.log("[STORAGE] Getting messages for user:", userId);
      const userMessages = await db.select().from(messages).where(eq(messages.senderId, userId));
      console.log("[STORAGE] Retrieved messages count:", userMessages.length);
      return userMessages;
    } catch (error) {
      console.error("[STORAGE] Error getting user messages:", error);
      if (error instanceof Error) {
        console.error("[STORAGE] Error stack:", error.stack);
      }
      throw new Error("Failed to get user messages");
    }
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
      console.log("[STORAGE] Getting transactions for user:", userId);
      const userTransactions = await db.select().from(transactions).where(eq(transactions.senderId, userId));
      console.log("[STORAGE] Retrieved transactions count:", userTransactions.length);
      return userTransactions;
    } catch (error) {
      console.error("[STORAGE] Error getting user transactions:", error);
      if (error instanceof Error) {
        console.error("[STORAGE] Error stack:", error.stack);
      }
      throw new Error("Failed to get user transactions");
    }
  }
}

export const storage = new DatabaseStorage();