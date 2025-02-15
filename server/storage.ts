import { User, InsertUser, Offer, Transaction } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private offers: Map<number, Offer>;
  private transactions: Map<number, Transaction>;
  sessionStore: session.Store;
  private userId: number;
  private offerId: number;
  private transactionId: number;

  constructor() {
    this.users = new Map();
    this.offers = new Map();
    this.transactions = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.userId = 1;
    this.offerId = 1;
    this.transactionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user = { ...insertUser, id, emailVerified: false, stripeCustomerId: null };
    this.users.set(id, user);
    return user;
  }

  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(offer: Omit<Offer, "id">): Promise<Offer> {
    const id = this.offerId++;
    const newOffer = { ...offer, id };
    this.offers.set(id, newOffer);
    return newOffer;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (t) => t.buyerId === userId || t.sellerId === userId
    );
  }

  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction = { 
      ...transaction, 
      id, 
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
}

export const storage = new MemStorage();
