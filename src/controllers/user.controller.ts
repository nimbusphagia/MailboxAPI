import { NextFunction, Request, Response } from "express";
import { UuidSchema } from "../schemas/util.schema";
import {
  changePassword,
  deleteUserServ,
  editUser,
  getUserById,
  getUsers,
} from "../services/user.service";
import {
  UserDeleteSchema,
  UserEditInputSchema,
  UserEditPasswordSchema,
} from "../schemas/user.schema";
import { UnauthorizedError } from "../errors";
import { uploadImage } from "../utils/uploadImage";
import { getProfilePicture } from "../services/assets.service";

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    const currentUserId = req.user.id;
    const users = await getUsers(currentUserId);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = UuidSchema.parse(req.params.id);
    const user = await getUserById(id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function edit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const data = UserEditInputSchema.parse(req.body);
    const currentUserId = req.user.id;
    if (req.file) {
      const result: any = await uploadImage(req.file.buffer, "msg");
      data.imgUrl = result.secure_url;
    }
    if (req.body.asset) {
      const validAsset = await getProfilePicture(req.body.asset);
      data.imgUrl = validAsset?.url ?? undefined;
    }
    const user = await editUser(data, currentUserId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const data = UserDeleteSchema.parse({ ...req.body, id: req.params.id });
    await deleteUserServ(data, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
export async function editPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const data = UserEditPasswordSchema.parse({
      ...req.body,
      id: req.params.id,
    });
    const user = await changePassword(data, req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
