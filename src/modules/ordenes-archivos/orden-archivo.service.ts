import { EstadoArchivo } from "@prisma/client";
import {
  createArchivo,
  findArchivoById,
  findArchivosByCliente,
  updateArchivoEstado,
} from "./orden-archivo.repository";

async function validarArchivoDeCuenta(
  archivoId: string,
  ordenServicioId: string,
  empresaId: string,
) {
  const archivo = await findArchivoById(archivoId);

  if (!archivo) {
    throw new Error("Archivo no encontrado");
  }

  if (archivo.ordenServicioId !== ordenServicioId) {
    throw new Error("El archivo no pertenece a este cliente");
  }

  return archivo;
}

export async function getArchivosService(ordenServicioId: string, empresaId: string) {
  return findArchivosByCliente(ordenServicioId);
}

export async function createArchivoService(
  ordenServicioId: string,
  empresaId: string,
  usuarioId: string,
  input: {
    nombre: string;
    categoria: string;
    mimeType: string;
    extension?: string;
    tamanoBytes?: number | null;
    storageKey: string;
    url?: string | null;
  },
) {
  return createArchivo({
    ...input,
    ordenServicioId,
    usuarioId: usuarioId,
  });
}

export async function updateArchivoEstadoService(
  archivoId: string,
  ordenServicioId: string,
  empresaId: string,
  estado: EstadoArchivo,
) {
  await validarArchivoDeCuenta(archivoId, ordenServicioId, empresaId);

  return updateArchivoEstado(archivoId, estado);
}
