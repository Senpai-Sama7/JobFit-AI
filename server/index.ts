import crypto from "crypto";
import express from "express";
import http from "http";
import router from "./routes";
import { errorHandler } from "./error";
import { authMiddleware } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimit";
import { securityHeaders } from "./middleware/securityHeaders";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(securityHeaders);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const requestId = crypto.randomUUID();
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;
    const duration = Date.now() - start;
    const logLine = JSON.stringify({
      requestId,
      method: req.method,
      path,
      status: res.statusCode,
      durationMs: duration,
      contentLength: Number(res.getHeader("content-length") || 0),
    });
    log(logLine);
  });

  next();
});

app.use('/api', rateLimiter);
app.use(authMiddleware);

(async () => {
  const server = http.createServer(app);
  app.use(router);

  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
