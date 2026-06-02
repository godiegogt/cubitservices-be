import { Request, Response, NextFunction } from "express";
import { extractTokenFromRequest } from "../utils/auth-cookie";
import { verifyAccessToken } from "../utils/jwt";
import prisma from "../../config/prisma";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado",
      });
    }

    const payload = verifyAccessToken(token);
    let nombres = payload.nombres;
    let apellidos = payload.apellidos;

    if (!nombres || !apellidos) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.userId },
        select: { nombres: true, apellidos: true },
      });

      nombres = usuario?.nombres ?? "";
      apellidos = usuario?.apellidos ?? "";
    }

    req.auth = {
      userId: payload.userId,
      empresaId: payload.empresaId,
      rolId: payload.rolId,
      nombres,
      apellidos,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}
