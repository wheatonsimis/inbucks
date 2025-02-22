import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { setupAuth } from "./auth";
import path from "path";

const app = express();

// Trust proxy when running behind Vercel
app.set('trust proxy', 1);

// Body parsing middleware must come before auth
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  console.log(`[REQUEST] ${req.method} ${path}`);
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${path} ${res.statusCode} in ${duration}ms`); 
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

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

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('[ERROR]', err);
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
        console.log('[REQUEST] Handling route:', req.path);
        if (req.path.startsWith('/api')) {
          console.log('[API] Forwarding to API handler:', req.path);
          next();
        } else {
          console.log('[SPA] Serving index.html for:', req.path);
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