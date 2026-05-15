"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const roles_routes_1 = __importDefault(require("./modules/roles/roles.routes"));
const usuarios_routes_1 = __importDefault(require("./modules/usuarios/usuarios.routes"));
const tipos_servicio_routes_1 = __importDefault(require("./modules/tipos-servicio/tipos-servicio.routes"));
const metodos_pago_routes_1 = __importDefault(require("./modules/metodos-pago/metodos-pago.routes"));
const clientes_routes_1 = __importDefault(require("./modules/clientes/clientes.routes"));
const politicas_cobro_routes_1 = __importDefault(require("./modules/politicas-cobro/politicas-cobro.routes"));
const cuentas_servicio_routes_1 = __importDefault(require("./modules/cuentas-servicio/cuentas-servicio.routes"));
const ordenes_routes_1 = __importDefault(require("./modules/ordenes/ordenes.routes"));
const cargos_routes_1 = __importDefault(require("./modules/cargos/cargos.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_ORIGIN,
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({ ok: true, message: "API running" });
});
app.get("/test-db", async (req, res) => {
    const result = await prisma_1.default.$queryRaw `SELECT NOW()`;
    res.json(result);
});
app.use("/auth", auth_routes_1.default);
app.use("/roles", roles_routes_1.default);
app.use("/usuarios", usuarios_routes_1.default);
app.use("/tipos-servicio", tipos_servicio_routes_1.default);
app.use("/metodos-pago", metodos_pago_routes_1.default);
app.use("/clientes", clientes_routes_1.default);
app.use("/politicas-cobro", politicas_cobro_routes_1.default);
app.use("/cuentas-servicio", cuentas_servicio_routes_1.default);
app.use("/ordenes", ordenes_routes_1.default);
app.use("/cargos", cargos_routes_1.default);
app.use("/cuentas-servicio", cargos_routes_1.default);
exports.default = app;
