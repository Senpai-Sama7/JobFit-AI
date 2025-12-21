import { type NextFunction, type Request, type Response } from "express";
import { getConfig } from "../config";
import { verifyJwt } from "../services/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) return next();

  let jwtSecret: string;
  let apiSecretKey: string | undefined;
  try {
    ({ authJwtSecret: jwtSecret, apiSecretKey } = getConfig());
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }

  if (apiSecretKey) {
    const providedKey = req.headers["x-api-key"];
    if (providedKey !== apiSecretKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader || Array.isArray(authHeader)) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  try {
    const claims = verifyJwt(token, jwtSecret);
    const subject = claims.sub ?? claims.userId;
    const userId = typeof subject === "string" ? Number(subject) : typeof subject === "number" ? subject : NaN;
    if (!userId || Number.isNaN(userId) || userId <= 0) {
      return res.status(401).json({ error: "Invalid token subject" });
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
