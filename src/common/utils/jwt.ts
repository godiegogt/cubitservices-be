import jwt from "jsonwebtoken";
import { env } from "../../config/env";

type JwtPayload = {
  userId: string;
  empresaId: string;
  rolId: string;
};

export const ACCESS_TOKEN_EXPIRES_IN = "8h";
export const ACCESS_TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
