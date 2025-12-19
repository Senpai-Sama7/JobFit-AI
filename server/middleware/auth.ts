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
  try {
    const keyIsValid =
      typeof providedKey === 'string' &&
      crypto.timingSafeEqual(Buffer.from(providedKey), Buffer.from(apiKey));
  if (!apiKey) {
    return res.status(500).json({ error: "API secret is not configured" });
  }

  const providedKey = req.headers["x-api-key"];
  if (typeof providedKey !== 'string') {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const keyBuf = Buffer.from(apiKey);
  const providedKeyBuf = Buffer.from(providedKey);

  // Use a constant-time comparison to prevent timing attacks.
  if (keyBuf.length !== providedKeyBuf.length || !crypto.timingSafeEqual(keyBuf, providedKeyBuf)) {
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
