import { ModuleCode } from "./module-codes"; 
import { RoleCode } from "./role-codes";

export const ROLE_MODULES: Record<RoleCode, ModuleCode[]> = {
    ADMINISTRADOR: Object.values(ModuleCode),

    CAJERO: [
    ModuleCode.DASHBOARD_FINANCIERO,
    ModuleCode.CLIENTES,
    ModuleCode.CUENTAS_SERVICIO,
    ModuleCode.PAGOS,
    ModuleCode.CARGOS,
    ModuleCode.REPORTE_PAGOS,
    ModuleCode.REPORTE_COBRANZA,
    ],

    OPERADOR: [
    ModuleCode.DASHBOARD_OPERATIVO,
    ModuleCode.CLIENTES,
    ModuleCode.CUENTAS_SERVICIO,
    ModuleCode.ORDENES,
    ModuleCode.REPORTE_CLIENTES,
    ModuleCode.REPORTE_ORDENES,
    ],

    TECNICO: [
    ModuleCode.ORDENES,
    ],
};