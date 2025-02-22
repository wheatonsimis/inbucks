import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { setupAuth } from "./auth";
import path from "path";
import cors from "cors";

const app = express();

// Trust proxy when running behind Vercel
app.set('trust proxy', 1);

// Configure CORS to allow credentials
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL || "https://your-domain.com" 
    : "http://localhost:5000",
  credentials: true,
}));

// Body parsing middleware must come before auth
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  console.log(`[REQUEST] ${req.method} ${path}`, {
    headers: {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
    session: req.session,
    user: req.user,
  });

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${path} ${res.statusCode} in ${duration}ms`, {
      body: bodyJson,
      headers: res.getHeaders(),
    });
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  next();
});

(async () => {
  try {
    // Setup authentication first
    console.log("[SETUP] Setting up authentication...");
    setupAuth(app);

    // Register API routes after auth is set up
    console.log("[SETUP] Registering routes...");
    const server = await registerRoutes(app);

    // Error handling middleware with detailed logging
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('[ERROR]', {
        error: err,
        stack: err.stack,
        status: err.status || err.statusCode || 500,
        message: err.message,
      });
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      const staticDir = path.join(process.cwd(), 'dist', 'public');
      console.log('Serving static files from:', staticDir);

      app.use(express.static(staticDir, {
        maxAge: '1y',
        etag: true
      }));

      app.all('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          next();
        } else {
          res.sendFile(path.join(staticDir, 'index.html'));
        }
      });
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error("[FATAL]", err);
    process.exit(1);
  }
})();