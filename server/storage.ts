import { User, InsertUser, Offer, Transaction } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, offers, transactions } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOffers(): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: Omit<Offer, "id">): Promise<Offer>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOffers(): Promise<Offer[]> {
    return await db.select().from(offers);
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }

  async createOffer(offer: Omit<Offer, "id">): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.buyerId, userId))
      .or(eq(transactions.sellerId, userId));
  }

  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({ ...transaction, createdAt: new Date() })
      .returning();
    return newTransaction;
  }
}

export const storage = new DatabaseStorage();