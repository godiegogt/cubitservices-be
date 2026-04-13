import { EstadoRegistroBasico } from "@prisma/client";
import {
  createRole,
  findRoleById,
  findRoleByName,
  findRolesByEmpresa,
  updateRole,
  updateRoleStatus,
} from "./roles.repository";

export async function getRoles(empresaId: string) {
  return findRolesByEmpresa(empresaId);
}

export async function createRoleService(input: {
  empresaId: string;
  nombre: string;
  descripcion?: string;
}) {
  const existingRole = await findRoleByName(input.empresaId, input.nombre);

  if (existingRole) {
    throw new Error("Ya existe un rol con ese nombre");
  }

  return createRole(input);
}

export async function updateRoleService(
  roleId: string,
  empresaId: string,
  input: {
    nombre?: string;
    descripcion?: string;
  }
) {
  const role = await findRoleById(roleId);

  if (!role || role.empresaId !== empresaId) {
    throw new Error("Rol no encontrado");
  }

  if (input.nombre && input.nombre !== role.nombre) {
    const existingRole = await findRoleByName(empresaId, input.nombre);

    if (existingRole) {
      throw new Error("Ya existe un rol con ese nombre");
    }
  }

  return updateRole(roleId, input);
}

export async function updateRoleStatusService(
  roleId: string,
  empresaId: string,
  estado: EstadoRegistroBasico
) {
  const role = await findRoleById(roleId);

  if (!role || role.empresaId !== empresaId) {
    throw new Error("Rol no encontrado");
  }

  return updateRoleStatus(roleId, estado);
}