"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClientes = listClientes;
exports.getClienteHandler = getClienteHandler;
exports.createClienteHandler = createClienteHandler;
exports.updateClienteHandler = updateClienteHandler;
exports.updateClienteStatusHandler = updateClienteStatusHandler;
exports.searchClientesSelectHandler = searchClientesSelectHandler;
const clientes_schemas_1 = require("./clientes.schemas");
const clientes_service_1 = require("./clientes.service");
async function listClientes(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const clientes = await (0, clientes_service_1.getClientes)(empresaId);
        return res.json({
            success: true,
            message: "Clientes obtenidos correctamente",
            data: clientes,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error obteniendo clientes",
        });
    }
}
async function getClienteHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const cliente = await (0, clientes_service_1.getClienteByIdService)(id, empresaId);
        return res.json({
            success: true,
            message: "Cliente obtenido correctamente",
            data: cliente,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Error obteniendo cliente",
        });
    }
}
async function createClienteHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = clientes_schemas_1.createClienteSchema.parse(req.body);
        const cliente = await (0, clientes_service_1.createClienteService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Cliente creado correctamente",
            data: cliente,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando cliente",
        });
    }
}
async function updateClienteHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = clientes_schemas_1.updateClienteSchema.parse(req.body);
        const cliente = await (0, clientes_service_1.updateClienteService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Cliente actualizado correctamente",
            data: cliente,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando cliente",
        });
    }
}
async function updateClienteStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = clientes_schemas_1.updateClienteStatusSchema.parse(req.body);
        const cliente = await (0, clientes_service_1.updateClienteStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado del cliente actualizado correctamente",
            data: cliente,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado del cliente",
        });
    }
}
async function searchClientesSelectHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { search } = clientes_schemas_1.searchClientesSelectSchema.parse(req.query);
        const clientes = await (0, clientes_service_1.searchClientesForSelectService)(empresaId, { search });
        return res.json({
            success: true,
            message: "Clientes obtenidos correctamente",
            data: clientes,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error buscando clientes",
        });
    }
}
