import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import path from "path";

const app = express();

// Trust proxy when running behind Vercel
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  console.log(`[REQUEST] ${req.method} ${path}`); // Add this line for debugging
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${path} ${res.statusCode} in ${duration}ms`); // Add this line
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
  // Register API routes first
  console.log("[SETUP] Registering routes..."); // Add this line
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('[ERROR]', err);
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve static files from the correct directory
    const staticDir = path.join(process.cwd(), 'dist', 'public');
    console.log('Serving static files from:', staticDir);

    // Serve static files with proper caching
    app.use(express.static(staticDir, {
      maxAge: '1y',
      etag: true
    }));

    // Only serve index.html for non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        console.log('[API] Forwarding to API handler:', req.path); // Add this line
        next(); // Let API routes be handled by the API router
      } else {
        console.log('[SPA] Serving index.html for:', req.path); // Add this line
        res.sendFile(path.join(staticDir, 'index.html'));
      }
    });
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
})();