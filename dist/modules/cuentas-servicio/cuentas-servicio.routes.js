"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const cuentas_servicio_controller_1 = require("./cuentas-servicio.controller");
const cuentas_servicio_archivo_routes_1 = __importDefault(require("../cuentas-servicio-archivo/cuentas-servicio-archivo.routes"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get("/", cuentas_servicio_controller_1.listCuentasServicio);
router.get("/select", cuentas_servicio_controller_1.listCuentasServicioSelectHandler);
router.get("/:id", cuentas_servicio_controller_1.getCuentaServicioHandler);
router.post("/", cuentas_servicio_controller_1.createCuentaServicioHandler);
router.patch("/:id", cuentas_servicio_controller_1.updateCuentaServicioHandler);
router.patch("/:id/estado", cuentas_servicio_controller_1.updateCuentaServicioStatusHandler);
router.use("/:cuentaServicioId/cuentas-servicio-archivo", cuentas_servicio_archivo_routes_1.default);
exports.default = router;
