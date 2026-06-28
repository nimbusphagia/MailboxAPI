import { NextFunction, Request, Response } from "express";
import { getAllProfilePictures } from "../services/assets.service";

export async function getProfilePictures(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const profilePictures = await getAllProfilePictures();
  return res.status(200).json(profilePictures);
}
