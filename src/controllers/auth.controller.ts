import { NextFunction, Request, Response } from "express";
import { validateLogin } from "../services/auth.service";
import { LoginSchema } from "../schemas/auth.schema";
import { UserInputSchema } from "../schemas/user.schema";
import { createUser, getUserById } from "../services/user.service";
import { UnauthorizedError } from "../errors";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = LoginSchema.parse(req.body);
    const token = await validateLogin(input);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      partitioned: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    next(err);
  }
}
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = UserInputSchema.parse(req.body);
    const user = await createUser(data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const user = await getUserById(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
