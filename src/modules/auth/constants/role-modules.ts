import { ModuleCode } from "./module-codes"; 
import { RoleCode } from "./role-codes";

export const ROLE_MODULES: Record<RoleCode, ModuleCode[]> = {
    ADMINISTRADOR: Object.values(ModuleCode),

    CAJERO: [
    ModuleCode.CLIENTES,
    ModuleCode.CUENTAS_SERVICIO,
    ModuleCode.PAGOS,
    ModuleCode.CARGOS,
    ],

    OPERADOR: [
    ModuleCode.CLIENTES,
    ModuleCode.CUENTAS_SERVICIO,
    ModuleCode.ORDENES,
    ModuleCode.REPORTES,
    ModuleCode.REPORTE_CLIENTES,
    ModuleCode.REPORTE_ORDENES,
    ],

    TECNICO: [
    ModuleCode.ORDENES,
    ModuleCode.REPORTES,
    ModuleCode.REPORTE_ORDENES
    ],
};