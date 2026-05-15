"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoliticasCobro = getPoliticasCobro;
exports.createPoliticaCobroService = createPoliticaCobroService;
exports.updatePoliticaCobroService = updatePoliticaCobroService;
exports.updatePoliticaCobroStatusService = updatePoliticaCobroStatusService;
const politicas_cobro_repository_1 = require("./politicas-cobro.repository");
async function getPoliticasCobro(empresaId) {
    return (0, politicas_cobro_repository_1.findPoliticasByEmpresa)(empresaId);
}
async function createPoliticaCobroService(input) {
    const existing = await (0, politicas_cobro_repository_1.findPoliticaByName)(input.empresaId, input.nombre);
    if (existing) {
        throw new Error("Ya existe una política de cobro con ese nombre");
    }
    return (0, politicas_cobro_repository_1.createPoliticaCobro)(input);
}
async function updatePoliticaCobroService(id, empresaId, input) {
    const politica = await (0, politicas_cobro_repository_1.findPoliticaById)(id);
    if (!politica || politica.empresaId !== empresaId) {
        throw new Error("Política de cobro no encontrada");
    }
    if (input.nombre && input.nombre !== politica.nombre) {
        const existing = await (0, politicas_cobro_repository_1.findPoliticaByName)(empresaId, input.nombre);
        if (existing) {
            throw new Error("Ya existe una política de cobro con ese nombre");
        }
    }
    const dataToUpdate = {
        ...input,
    };
    if (input.aplicaMora === false) {
        dataToUpdate.tipoMora = null;
        dataToUpdate.valorMora = null;
    }
    return (0, politicas_cobro_repository_1.updatePoliticaCobro)(id, dataToUpdate);
}
async function updatePoliticaCobroStatusService(id, empresaId, estado) {
    const politica = await (0, politicas_cobro_repository_1.findPoliticaById)(id);
    if (!politica || politica.empresaId !== empresaId) {
        throw new Error("Política de cobro no encontrada");
    }
    return (0, politicas_cobro_repository_1.updatePoliticaCobroStatus)(id, estado);
}
