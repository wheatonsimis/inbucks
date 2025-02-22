import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOfferSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Add health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Set up authentication routes first
  setupAuth(app);

  // Offers
  app.get("/api/offers", async (req, res) => {
    const offers = await storage.getOffers();
    res.json(offers);
  });

  app.post("/api/offers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer({
        ...offerData,
        userId: req.user.id,
      });
      res.status(201).json(offer);
    } catch (err) {
      res.status(400).json({ error: "Invalid offer data" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getUserMessages(req.user.id);
    res.json(messages);
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactions = await storage.getUserTransactions(req.user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const transaction = await storage.createTransaction({
        senderId: req.user.id,
        recipientId: req.body.recipientId,
        messageId: req.body.messageId,
        amount: req.body.amount,
        status: "pending"
      });

      res.status(201).json(transaction);
    } catch (err) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  console.log('[ROUTES] Creating HTTP server...');
  const httpServer = createServer(app);
  return httpServer;
}