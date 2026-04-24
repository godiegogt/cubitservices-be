import { EstadoArchivo } from "@prisma/client";
import {
    createArchivo,
    findArchivoById,
    findArchivosByCliente,
    updateArchivoEstado,
} from "./cliente-archivo.repository";

async function validarArchivoDeCuenta(
    archivoId: string,
    clienteId: string,
    empresaId: string
) {
    const archivo = await findArchivoById(archivoId);

    if (!archivo) {
        throw new Error("Archivo no encontrado");
    }

    if (archivo.clienteId !== clienteId) {
        throw new Error("El archivo no pertenece a este cliente");
    }

    return archivo;
}

export async function getArchivosService(clienteId: string, empresaId: string) {
    return findArchivosByCliente(clienteId);
}

export async function createArchivoService(
    clienteId: string,
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
    }
) {
    return createArchivo({
        ...input,
        clienteId,
        subidoPor: usuarioId,
    });
}

export async function updateArchivoEstadoService(
    archivoId: string,
    clienteId: string,
    empresaId: string,
    estado: EstadoArchivo
) {
    await validarArchivoDeCuenta(archivoId, clienteId, empresaId);

    return updateArchivoEstado(archivoId, estado);
}