import "dotenv/config"
import { TextEncoder } from "node:util";

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
