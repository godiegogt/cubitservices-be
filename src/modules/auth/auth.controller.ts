import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { loginSchema } from "./auth.schemas";
import { loginUser } from "./auth.service";

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.parse(req.body);

    const result = await loginUser(parsed.email, parsed.password);

    return res.json({
      success: true,
      message: "Login correcto",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Error de autenticación",
    });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const auth = req.auth!;

    const user = await prisma.usuario.findUnique({
      where: { id: auth.userId },
      include: {
        rol: true,
        empresa: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Sesión actual",
      data: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        estado: user.estado,
        empresa: {
          id: user.empresa.id,
          nombre: user.empresa.nombre,
        },
        rol: {
          id: user.rol.id,
          nombre: user.rol.nombre,
        },
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo sesión",
    });
  }
}