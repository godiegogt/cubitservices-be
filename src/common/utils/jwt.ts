import jwt from "jsonwebtoken";
import { env } from "../../config/env";

type JwtPayload = {
  userId: string;
  empresaId: string;
  rolId: string;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "8h",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}