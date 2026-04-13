import { EstadoUsuario } from "@prisma/client";
import { hashText } from "../../common/utils/hash";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUsersByEmpresa,
  updateUser,
} from "./usuarios.repository";

export async function getUsers(empresaId: string) {
  return findUsersByEmpresa(empresaId);
}

export async function createUserService(input: {
  empresaId: string;
  nombres: string;
  apellidos?: string;
  email: string;
  password: string;
  telefono?: string;
  rolId: string;
}) {
  const existingUser = await findUserByEmail(input.empresaId, input.email);

  if (existingUser) {
    throw new Error("El email ya está registrado");
  }

  const passwordHash = await hashText(input.password);

  return createUser({
    empresaId: input.empresaId,
    nombres: input.nombres,
    apellidos: input.apellidos,
    email: input.email,
    passwordHash,
    telefono: input.telefono,
    rolId: input.rolId,
    estado: EstadoUsuario.ACTIVO,
  });
}

export async function updateUserService(
  userId: string,
  empresaId: string,
  input: any
) {
  const user = await findUserById(userId);

  if (!user || user.empresaId !== empresaId) {
    throw new Error("Usuario no encontrado");
  }

  return updateUser(userId, input);
}

export async function updateUserStatusService(
  userId: string,
  empresaId: string,
  estado: EstadoUsuario
) {
  const user = await findUserById(userId);

  if (!user || user.empresaId !== empresaId) {
    throw new Error("Usuario no encontrado");
  }

  return updateUser(userId, { estado });
}