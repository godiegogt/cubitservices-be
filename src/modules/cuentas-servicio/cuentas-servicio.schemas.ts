import { EstadoCuentaServicio, FrecuenciaServicio, ModalidadServicio } from "@prisma/client";
import { z } from "zod";

const dateStringSchema = z.string().date();

const createCuentaServicioBaseSchema = z.object({
  clienteId: z.string().uuid(),
  ubicacionId: z.string().uuid().optional(),
  tipoServicioId: z.string().uuid(),
  politicaCobroId: z.string().uuid().optional(),
  codigo: z.string().min(1).max(50),
  nombre: z.string().min(1).max(180),
  descripcion: z.string().optional(),
  modalidad: z.nativeEnum(ModalidadServicio),
  frecuencia: z.nativeEnum(FrecuenciaServicio).optional(),
  fechaInicio: dateStringSchema.optional(),
  fechaFin: dateStringSchema.nullable().optional(),
  montoBase: z.number().min(0),
  diaCorte: z.number().int().min(1).max(31).optional(),
  diaPago: z.number().int().min(1).max(31).optional(),
  observaciones: z.string().optional(),
});

const updateCuentaServicioBaseSchema = z.object({
  clienteId: z.string().uuid().optional(),
  ubicacionId: z.string().uuid().nullable().optional(),
  tipoServicioId: z.string().uuid().optional(),
  politicaCobroId: z.string().uuid().nullable().optional(),
  codigo: z.string().min(1).max(50).optional(),
  nombre: z.string().min(1).max(180).optional(),
  descripcion: z.string().optional(),
  modalidad: z.nativeEnum(ModalidadServicio).optional(),
  frecuencia: z.nativeEnum(FrecuenciaServicio).nullable().optional(),
  fechaInicio: dateStringSchema.nullable().optional(),
  fechaFin: dateStringSchema.nullable().optional(),
  montoBase: z.number().min(0).optional(),
  diaCorte: z.number().int().min(1).max(31).nullable().optional(),
  diaPago: z.number().int().min(1).max(31).nullable().optional(),
  observaciones: z.string().optional(),
});

export const createCuentaServicioSchema = createCuentaServicioBaseSchema.superRefine(
  (data, ctx) => {
    if (data.modalidad === ModalidadServicio.RECURRENTE) {
      if (!data.frecuencia) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["frecuencia"],
          message: "frecuencia es obligatoria para modalidad RECURRENTE",
        });
      }

      if (!data.politicaCobroId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["politicaCobroId"],
          message: "politicaCobroId es obligatoria para modalidad RECURRENTE",
        });
      }
    }

    if (data.modalidad === ModalidadServicio.PUNTUAL && data.frecuencia !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["frecuencia"],
        message: "frecuencia no debe enviarse para modalidad PUNTUAL",
      });
    }
  }
);

export const updateCuentaServicioSchema = updateCuentaServicioBaseSchema.superRefine(
  (data, ctx) => {
    if (data.modalidad === ModalidadServicio.RECURRENTE) {
      if (data.frecuencia === undefined || data.frecuencia === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["frecuencia"],
          message: "frecuencia es obligatoria cuando modalidad es RECURRENTE",
        });
      }

      if (data.politicaCobroId === undefined || data.politicaCobroId === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["politicaCobroId"],
          message: "politicaCobroId es obligatoria cuando modalidad es RECURRENTE",
        });
      }
    }

    if (data.modalidad === ModalidadServicio.PUNTUAL && data.frecuencia !== undefined) {
      if (data.frecuencia !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["frecuencia"],
          message: "frecuencia no debe enviarse para modalidad PUNTUAL",
        });
      }
    }
  }
);

export const updateCuentaServicioStatusSchema = z.object({
  estado: z.nativeEnum(EstadoCuentaServicio),
  motivo: z.string().max(500).optional(),
});
