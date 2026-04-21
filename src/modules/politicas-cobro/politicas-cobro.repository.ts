import prisma from "../../config/prisma";
import {
  EstadoRegistroBasico,
  TipoMora,
  TipoVencimiento,
} from "@prisma/client";

export async function findPoliticasByEmpresa(empresaId: string) {
  return prisma.politicaCobro.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findPoliticaById(id: string) {
  return prisma.politicaCobro.findUnique({
    where: { id },
  });
}

export async function findPoliticaByName(empresaId: string, nombre: string) {
  return prisma.politicaCobro.findFirst({
    where: {
      empresaId,
      nombre,
    },
  });
}

export async function createPoliticaCobro(data: {
  empresaId: string;
  nombre: string;
  tipoVencimiento: TipoVencimiento;
  diaCorte?: number;
  diaVencimiento?: number;
  diasGracia: number;
  aplicaMora: boolean;
  tipoMora?: TipoMora;
  valorMora?: number;
}) {
  return prisma.politicaCobro.create({
    data: {
      empresaId: data.empresaId,
      nombre: data.nombre,
      tipoVencimiento: data.tipoVencimiento,
      diaCorte: data.diaCorte,
      diaVencimiento: data.diaVencimiento,
      diasGracia: data.diasGracia,
      aplicaMora: data.aplicaMora,
      tipoMora: data.tipoMora,
      valorMora: data.valorMora,
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });
}

export async function updatePoliticaCobro(
  id: string,
  data: {
    nombre?: string;
    tipoVencimiento?: TipoVencimiento;
    diaCorte?: number | null;
    diaVencimiento?: number | null;
    diasGracia?: number;
    aplicaMora?: boolean;
    tipoMora?: TipoMora | null;
    valorMora?: number | null;
  }
) {
  return prisma.politicaCobro.update({
    where: { id },
    data,
  });
}

export async function updatePoliticaCobroStatus(
  id: string,
  estado: EstadoRegistroBasico
) {
  return prisma.politicaCobro.update({
    where: { id },
    data: { estado },
  });
}
