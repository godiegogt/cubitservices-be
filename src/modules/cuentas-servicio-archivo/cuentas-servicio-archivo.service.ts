import { EstadoArchivo } from "@prisma/client";
import { createArchivo, findArchivoById, findArchivosByCuentaServicio, updateArchivoEstado } from "./cuentas-servicio-archivo.repository";

async function validarArchivoDeCuenta(
    archivoId: string,
    cuentaServicioId: string,
    empresaId: string
) {
    const archivo = await findArchivoById(archivoId);

    if (!archivo) {
        throw new Error("Archivo no encontrado");
    }

    if (archivo.cuentaServicioId !== cuentaServicioId) {
        throw new Error("El archivo no pertenece a esta cuenta de servicio");
    }

    return archivo;
}

export async function getArchivosService(cuentaServicioId: string, empresaId: string) {
    console.log(cuentaServicioId)
    return findArchivosByCuentaServicio(cuentaServicioId);
}

export async function createArchivoService(
    cuentaServicioId: string,
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
        cuentaServicioId,
        subidoPor: usuarioId,
    });
}

export async function updateArchivoEstadoService(
    archivoId: string,
    cuentaServicioId: string,
    empresaId: string,
    estado: EstadoArchivo
) {
    await validarArchivoDeCuenta(archivoId, cuentaServicioId, empresaId);

    return updateArchivoEstado(archivoId, estado);
}

