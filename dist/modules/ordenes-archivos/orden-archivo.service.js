"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArchivosService = getArchivosService;
exports.createArchivoService = createArchivoService;
exports.updateArchivoEstadoService = updateArchivoEstadoService;
const orden_archivo_repository_1 = require("./orden-archivo.repository");
async function validarArchivoDeCuenta(archivoId, ordenServicioId, empresaId) {
    const archivo = await (0, orden_archivo_repository_1.findArchivoById)(archivoId);
    if (!archivo) {
        throw new Error("Archivo no encontrado");
    }
    if (archivo.ordenServicioId !== ordenServicioId) {
        throw new Error("El archivo no pertenece a este cliente");
    }
    return archivo;
}
async function getArchivosService(ordenServicioId, empresaId) {
    return (0, orden_archivo_repository_1.findArchivosByCliente)(ordenServicioId);
}
async function createArchivoService(ordenServicioId, empresaId, usuarioId, input) {
    return (0, orden_archivo_repository_1.createArchivo)({
        ...input,
        ordenServicioId,
        usuarioId: usuarioId,
    });
}
async function updateArchivoEstadoService(archivoId, ordenServicioId, empresaId, estado) {
    await validarArchivoDeCuenta(archivoId, ordenServicioId, empresaId);
    return (0, orden_archivo_repository_1.updateArchivoEstado)(archivoId, estado);
}
