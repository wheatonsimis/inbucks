import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";

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

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

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
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          console.log("[AUTH] Attempting login for email:", email);
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            console.log("[AUTH] Login failed: User not found or no password");
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            console.log("[AUTH] Login failed: Invalid password");
            return done(null, false, { message: "Invalid email or password" });
          }

          console.log("[AUTH] Login successful for user:", email);
          return done(null, user);
        } catch (err) {
          console.error("[AUTH] Login error:", err);
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("[AUTH] Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("[AUTH] Deserializing user:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("[AUTH] Deserialization failed: User not found");
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (err) {
      console.error("[AUTH] Deserialization error:", err);
      done(err);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    console.log("[AUTH] Registration attempt:", { email: req.body.email });
    try {
      const validatedData = registerSchema.parse(req.body);

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        console.log("[AUTH] Registration failed: Email exists");
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      console.log("[AUTH] Creating new user");
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          console.error("[AUTH] Login after registration failed:", err);
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        console.log("[AUTH] User registered and logged in successfully:", user.id);
        return res.status(201).json(user);
      });
    } catch (err) {
      console.error("[AUTH] Registration error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(500).json({ message: "Internal server error during registration" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    console.log("[AUTH] Login attempt:", req.body.email);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("[AUTH] Login error:", err);
        return res.status(500).json({ message: "Internal server error during login" });
      }
      if (!user) {
        console.log("[AUTH] Login failed: Invalid credentials");
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("[AUTH] Session creation error:", err);
          return res.status(500).json({ message: "Error creating session" });
        }
        console.log("[AUTH] Login successful:", user.id);
        res.json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    if (req.user) {
      console.log("[AUTH] Logout attempt for user:", req.user.id);
      req.logout((err) => {
        if (err) {
          console.error("[AUTH] Logout error:", err);
          return res.status(500).json({ message: "Error during logout" });
        }
        console.log("[AUTH] Logout successful");
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(200);
    }
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