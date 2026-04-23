import { z } from "zod";
import {
  EstadoRegistroBasico,
  TipoCliente,
  TipoIdentificacion,
} from "@prisma/client";

export const createClienteSchema = z
  .object({
    codigo: z.string().min(1).max(50),
    tipoCliente: z.nativeEnum(TipoCliente),

    primerNombre: z.string().max(80).optional(),
    segundoNombre: z.string().max(80).optional(),
    primerApellido: z.string().max(80).optional(),
    segundoApellido: z.string().max(80).optional(),

    nombreRazonSocial: z.string().min(1).max(180),
    nombreComercial: z.string().max(180).optional(),

    tipoIdentificacion: z.nativeEnum(TipoIdentificacion).optional(),
    identificacion: z.string().max(60).optional(),

    telefono: z.string().max(30).optional(),
    email: z.string().email().optional(),
    direccionFiscal: z.string().optional(),
    observaciones: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoCliente === TipoCliente.INDIVIDUAL) {
      if (!data.primerNombre) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primerNombre"],
          message: "El primer nombre es obligatorio para cliente individual",
        });
      }

      if (!data.primerApellido) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primerApellido"],
          message: "El primer apellido es obligatorio para cliente individual",
        });
      }
    }
  });

export const updateClienteSchema = z.object({
  tipoCliente: z.nativeEnum(TipoCliente).optional(),

  primerNombre: z.string().max(80).optional(),
  segundoNombre: z.string().max(80).optional(),
  primerApellido: z.string().max(80).optional(),
  segundoApellido: z.string().max(80).optional(),

  nombreRazonSocial: z.string().min(1).max(180).optional(),
  nombreComercial: z.string().max(180).optional(),

  tipoIdentificacion: z.nativeEnum(TipoIdentificacion).optional(),
  identificacion: z.string().max(60).optional(),

  telefono: z.string().max(30).optional(),
  email: z.string().email().optional(),
  direccionFiscal: z.string().optional(),
  observaciones: z.string().optional(),
});

export const updateClienteStatusSchema = z.object({
  estado: z.nativeEnum(EstadoRegistroBasico),
});

export const searchClientesSelectSchema = z.object({
  search: z.string().max(100).optional(),
});