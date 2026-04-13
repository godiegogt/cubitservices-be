import { EstadoUsuario } from "@prisma/client";
import { compareHash } from "../../common/utils/hash";
import { signAccessToken } from "../../common/utils/jwt";
import { findUserByEmail, updateLastAccess } from "./auth.repository";

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  if (user.estado === EstadoUsuario.INACTIVO || user.estado === EstadoUsuario.BLOQUEADO) {
    throw new Error("Usuario inactivo o bloqueado");
  }

  const isValidPassword = await compareHash(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Credenciales inválidas");
  }

  await updateLastAccess(user.id);

  const token = signAccessToken({
    userId: user.id,
    empresaId: user.empresaId,
    rolId: user.rolId,
  });

  return {
    token,
    user: {
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
  };
}