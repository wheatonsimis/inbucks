import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Made optional for OAuth users
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  emailVerified: boolean("email_verified").default(false),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  responseTimeHours: integer("response_time_hours").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  amount: decimal("amount").notNull(),
  status: text("status").notNull(), // pending, completed, refunded
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  title: true,
  description: true,
  price: true,
  responseTimeHours: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;