import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  console.log("[AUTH] Starting auth setup...");

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "development_secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  console.log("[AUTH] Setting up session middleware");
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  console.log("[AUTH] Configuring passport strategies");
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("[AUTH] Attempting local login for username:", username);
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password || !(await comparePasswords(password, user.password))) {
          console.log("[AUTH] Login failed: Invalid credentials");
          return done(null, false);
        }
        console.log("[AUTH] Login successful for user:", username);
        return done(null, user);
      } catch (err) {
        console.error("[AUTH] Login error:", err);
        return done(err as Error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("[AUTH] Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("[AUTH] Deserializing user:", id);
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      console.error("[AUTH] Deserialization error:", err);
      done(err);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    console.log("[AUTH] Registration attempt:", { username: req.body.username, email: req.body.email });
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("[AUTH] Registration failed: Username exists");
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      console.log("[AUTH] User created successfully:", user.id);
      req.login(user, (err) => {
        if (err) {
          console.error("[AUTH] Login after registration failed:", err);
          return next(err);
        }
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("[AUTH] Registration error:", err);
      next(err);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    console.log("[AUTH] Login attempt:", req.body.username);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("[AUTH] Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("[AUTH] Login failed: Invalid credentials");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("[AUTH] Session creation error:", err);
          return next(err);
        }
        console.log("[AUTH] Login successful:", user.id);
        res.json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    console.log("[AUTH] Logout attempt for user:", req.user?.id);
    req.logout((err) => {
      if (err) {
        console.error("[AUTH] Logout error:", err);
        return next(err);
      }
      console.log("[AUTH] Logout successful");
      res.sendStatus(200);
    });
  });

  // User info endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("[AUTH] Unauthenticated user info request");
      return res.sendStatus(401);
    }
    console.log("[AUTH] User info request:", req.user.id);
    res.json(req.user);
  });

  console.log("[AUTH] Auth setup completed");
}