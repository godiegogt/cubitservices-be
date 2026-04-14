import { CookieOptions, Request } from "express";
import { env } from "../../config/env";
import { ACCESS_TOKEN_MAX_AGE_MS } from "./jwt";

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    path: "/",
  };
}

export function extractTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");

    if (name === env.AUTH_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}
