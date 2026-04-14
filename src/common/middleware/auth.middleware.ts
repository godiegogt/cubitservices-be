import { Request, Response, NextFunction } from "express";
import { extractTokenFromRequest } from "../utils/auth-cookie";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado",
      });
    }

    const payload = verifyAccessToken(token);

    req.auth = {
      userId: payload.userId,
      empresaId: payload.empresaId,
      rolId: payload.rolId,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}
