import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

const apiKey = process.env.API_SECRET_KEY;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) return next();

  if (!apiKey) {
    return res.status(500).json({ error: "API secret is not configured" });
  }

  const providedKey = req.headers["x-api-key"];
  if (providedKey !== apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userHeader = req.headers["x-user-id"];
  const userId = typeof userHeader === "string" ? Number(userHeader) : Array.isArray(userHeader) ? Number(userHeader[0]) : NaN;
  if (!userId || Number.isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: "Missing or invalid user id" });
  }

  req.userId = userId;
  next();
}
