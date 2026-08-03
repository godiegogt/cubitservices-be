import { Prisma } from "@prisma/client";

export class CargoDuplicadoError extends Error {
  constructor(message = "Ya existe un cargo SERVICIO para ese periodo") {
    super(message);
    this.name = "CargoDuplicadoError";
  }
}

export function esErrorDuplicado(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return true;
  }

  return error instanceof CargoDuplicadoError;
}
