import express from "express";
import router from "./routes";
import http from "http";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler } from "./error";
import { setupAuth } from "./auth";
import { requestLogger, errorRequestLogger, healthCheck } from "./middleware/request-logger";
import { logger } from "./logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint (before logging to reduce noise)
app.get('/health', healthCheck());

// Request logging middleware
app.use(requestLogger());

// Setup authentication (session + passport)
setupAuth(app);

(async () => {
  const server = http.createServer(app);
  app.use(router);

  // Error logging and handling
  app.use(errorRequestLogger());
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
    logger.info(`Server started`, { port, env: app.get('env') });
  });
})();
