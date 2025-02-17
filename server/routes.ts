import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOfferSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

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

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const transactions = await storage.getUserTransactions(req.user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { offerId } = req.body;
      const offer = await storage.getOffer(offerId);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      const transaction = await storage.createTransaction({
        offerId,
        buyerId: req.user.id,
        sellerId: offer.userId,
        amount: offer.price,
        status: "pending",
      });

      res.status(201).json(transaction);
    } catch (err) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}