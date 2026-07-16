import { z } from "zod";
import { EstadoCargo, EstadoCuentaServicio } from "@prisma/client";

const ESTADOS_CARGO_PERMITIDOS: EstadoCargo[] = [
    EstadoCargo.PENDIENTE,
    EstadoCargo.PARCIAL,
    EstadoCargo.VENCIDO,
];

const estadoCargoSchema = z
    .union([z.nativeEnum(EstadoCargo), z.array(z.nativeEnum(EstadoCargo))])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .refine(
    (value) => value.every((estado) => ESTADOS_CARGO_PERMITIDOS.includes(estado)),
    { message: "estadoCargo debe ser PENDIENTE, PARCIAL o VENCIDO" },
    );

const estadoServicioSchema = z
    .nativeEnum(EstadoCuentaServicio)
    .refine(
    (value) =>
        value === EstadoCuentaServicio.ACTIVA ||
        value === EstadoCuentaServicio.SUSPENDIDA,
    { message: "estadoServicio debe ser ACTIVA o SUSPENDIDA" },
    );

const filtersSchema = z.object({
    codigoCliente: z.string().min(1).max(50).optional(),
    nombreCliente: z.string().min(1).max(150).optional(),
    estadoCargo: estadoCargoSchema.optional(),
    estadoServicio: estadoServicioSchema.optional(),
    tipoServicioId: z.string().uuid().optional(),
    zona: z.coerce.number().int().min(0).optional(),
});

export const cobranzaReportQuerySchema = filtersSchema.extend({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const cobranzaReportExportSchema = filtersSchema;

export type CobranzaReportQuery = z.infer<typeof cobranzaReportQuerySchema>;
export type CobranzaReportExportQuery = z.infer<
    typeof cobranzaReportExportSchema
>;
