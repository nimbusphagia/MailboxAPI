import { NextFunction, Request, Response } from "express";
import { JWTPayload, jwtVerify } from "jose";
import { UnauthorizedError } from "../errors";
import { JWT_SECRET } from "../config/jwt";

interface AuthPayload extends JWTPayload {
  sub: string;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new UnauthorizedError("No token provided");
    const { payload } = await jwtVerify<AuthPayload>(token, JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
