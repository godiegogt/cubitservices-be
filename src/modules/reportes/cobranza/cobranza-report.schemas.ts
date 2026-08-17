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
    fechaInicio: z.string().date().optional(),
    fechaFin: z.string().date().optional(),
    codigoCliente: z.string().min(1).max(50).optional(),
    nombreCliente: z.string().min(1).max(150).optional(),
    estadoCargo: estadoCargoSchema.optional(),
    estadoServicio: estadoServicioSchema.optional(),
    tipoServicioId: z.string().uuid().optional(),
    zona: z.string().trim().min(1).optional(),
    aldea: z.string().trim().min(1).optional(),
});

const rangoFechasRefineOptions = {
    message: "fechaInicio no puede ser mayor que fechaFin",
    path: ["fechaInicio"] as string[],
};

function validarRangoFechas(d: { fechaInicio?: string; fechaFin?: string }) {
    return !(d.fechaInicio && d.fechaFin && d.fechaInicio > d.fechaFin);
}

export const cobranzaReportQuerySchema = filtersSchema
    .extend({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    })
    .refine(validarRangoFechas, rangoFechasRefineOptions);

export const cobranzaReportExportSchema = filtersSchema.refine(
    validarRangoFechas,
    rangoFechasRefineOptions,
);

export type CobranzaReportQuery = z.infer<typeof cobranzaReportQuerySchema>;
export type CobranzaReportExportQuery = z.infer<
    typeof cobranzaReportExportSchema
>;
