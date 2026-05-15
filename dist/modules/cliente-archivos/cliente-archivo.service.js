"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArchivosService = getArchivosService;
exports.createArchivoService = createArchivoService;
exports.updateArchivoEstadoService = updateArchivoEstadoService;
const cliente_archivo_repository_1 = require("./cliente-archivo.repository");
async function validarArchivoDeCuenta(archivoId, clienteId, empresaId) {
    const archivo = await (0, cliente_archivo_repository_1.findArchivoById)(archivoId);
    if (!archivo) {
        throw new Error("Archivo no encontrado");
    }
    if (archivo.clienteId !== clienteId) {
        throw new Error("El archivo no pertenece a este cliente");
    }
    return archivo;
}
async function getArchivosService(clienteId, empresaId) {
    return (0, cliente_archivo_repository_1.findArchivosByCliente)(clienteId);
}
async function createArchivoService(clienteId, empresaId, usuarioId, input) {
    return (0, cliente_archivo_repository_1.createArchivo)({
        ...input,
        clienteId,
        subidoPor: usuarioId,
    });
}
async function updateArchivoEstadoService(archivoId, clienteId, empresaId, estado) {
    await validarArchivoDeCuenta(archivoId, clienteId, empresaId);
    return (0, cliente_archivo_repository_1.updateArchivoEstado)(archivoId, estado);
}
