"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArchivosService = getArchivosService;
exports.createArchivoService = createArchivoService;
exports.updateArchivoEstadoService = updateArchivoEstadoService;
const cuentas_servicio_archivo_repository_1 = require("./cuentas-servicio-archivo.repository");
async function validarArchivoDeCuenta(archivoId, cuentaServicioId, empresaId) {
    const archivo = await (0, cuentas_servicio_archivo_repository_1.findArchivoById)(archivoId);
    if (!archivo) {
        throw new Error("Archivo no encontrado");
    }
    if (archivo.cuentaServicioId !== cuentaServicioId) {
        throw new Error("El archivo no pertenece a esta cuenta de servicio");
    }
    return archivo;
}
async function getArchivosService(cuentaServicioId, empresaId) {
    console.log(cuentaServicioId);
    return (0, cuentas_servicio_archivo_repository_1.findArchivosByCuentaServicio)(cuentaServicioId);
}
async function createArchivoService(cuentaServicioId, empresaId, usuarioId, input) {
    return (0, cuentas_servicio_archivo_repository_1.createArchivo)({
        ...input,
        cuentaServicioId,
        subidoPor: usuarioId,
    });
}
async function updateArchivoEstadoService(archivoId, cuentaServicioId, empresaId, estado) {
    await validarArchivoDeCuenta(archivoId, cuentaServicioId, empresaId);
    return (0, cuentas_servicio_archivo_repository_1.updateArchivoEstado)(archivoId, estado);
}
