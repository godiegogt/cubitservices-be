import { z } from "zod";
import {
  EstadoRegistroBasico,
  TipoMora,
  TipoVencimiento,
} from "@prisma/client";

const politicaCobroBaseSchema = z.object({
  nombre: z.string().min(1).max(120),
  tipoVencimiento: z.nativeEnum(TipoVencimiento),
  diaCorte: z.number().int().min(1).max(31).optional(),
  diaVencimiento: z.number().int().min(1).max(31).optional(),
  diasGracia: z.number().int().min(0),
  aplicaMora: z.boolean(),
  tipoMora: z.nativeEnum(TipoMora).optional(),
  valorMora: z.number().min(0).optional(),
});

export const createPoliticaCobroSchema = politicaCobroBaseSchema.superRefine(
  (data, ctx) => {
    if (
      data.tipoVencimiento === TipoVencimiento.FECHA_FIJA &&
      !data.diaVencimiento
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diaVencimiento"],
        message: "diaVencimiento es obligatorio para FECHA_FIJA",
      });
    }

    if (
      data.tipoVencimiento === TipoVencimiento.FIN_MES &&
      data.diaVencimiento !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diaVencimiento"],
        message: "FIN_MES no debería llevar diaVencimiento",
      });
    }

    if (data.aplicaMora) {
      if (!data.tipoMora) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tipoMora"],
          message: "tipoMora es obligatorio cuando aplicaMora es true",
        });
      }

      if (data.valorMora === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valorMora"],
          message: "valorMora es obligatorio cuando aplicaMora es true",
        });
      }
    }

    if (!data.aplicaMora) {
      if (data.tipoMora !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tipoMora"],
          message: "No debe enviar tipoMora si aplicaMora es false",
        });
      }

      if (data.valorMora !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valorMora"],
          message: "No debe enviar valorMora si aplicaMora es false",
        });
      }
    }
  }
);

export const updatePoliticaCobroSchema = politicaCobroBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (
      data.tipoVencimiento === TipoVencimiento.FECHA_FIJA &&
      data.diaVencimiento === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diaVencimiento"],
        message: "Si tipoVencimiento es FECHA_FIJA, debes enviar diaVencimiento",
      });
    }

    if (
      data.tipoVencimiento === TipoVencimiento.FIN_MES &&
      data.diaVencimiento !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diaVencimiento"],
        message: "FIN_MES no debería llevar diaVencimiento",
      });
    }

    if (data.aplicaMora === true) {
      if (data.tipoMora === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tipoMora"],
          message: "tipoMora es obligatorio cuando aplicaMora es true",
        });
      }

      if (data.valorMora === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valorMora"],
          message: "valorMora es obligatorio cuando aplicaMora es true",
        });
      }
    }

    if (data.aplicaMora === false) {
      if (data.tipoMora !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tipoMora"],
          message: "No debe enviar tipoMora si aplicaMora es false",
        });
      }

      if (data.valorMora !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valorMora"],
          message: "No debe enviar valorMora si aplicaMora es false",
        });
      }
    }
  });

export const updatePoliticaCobroStatusSchema = z.object({
  estado: z.nativeEnum(EstadoRegistroBasico),
});