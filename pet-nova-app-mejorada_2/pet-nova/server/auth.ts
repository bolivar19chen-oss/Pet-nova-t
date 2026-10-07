import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// In production set a real secret via the JWT_SECRET env var. This
// fallback is fine for local/demo use but you MUST change it before
// handling real user data publicly.
const JWT_SECRET = process.env.JWT_SECRET || "pet-nova-dev-secret-change-me";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export interface AuthedRequest extends Request {
  userId?: string;
}

// Optional auth: if a valid token is present, attaches req.userId.
// Does NOT block the request if missing/invalid — most endpoints in
// this demo stay open so the app keeps working without login. Add
// `requireAuth` instead on any route you want to lock down.
export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
    } catch {
      /* invalid/expired token — treat as anonymous */
    }
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ error: "Debes iniciar sesión" });
  next();
}
