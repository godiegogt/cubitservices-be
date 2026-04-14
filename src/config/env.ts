import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-key",
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || "access_token",
};
