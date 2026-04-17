import {
  EstadoRegistroBasico,
  TipoMora,
  TipoVencimiento,
} from "@prisma/client";
import {
  createPoliticaCobro,
  findPoliticaById,
  findPoliticaByName,
  findPoliticasByEmpresa,
  updatePoliticaCobro,
  updatePoliticaCobroStatus,
} from "./politicas-cobro.repository";

export async function getPoliticasCobro(empresaId: string) {
  return findPoliticasByEmpresa(empresaId);
}

export async function createPoliticaCobroService(input: {
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
  const existing = await findPoliticaByName(input.empresaId, input.nombre);

  if (existing) {
    throw new Error("Ya existe una política de cobro con ese nombre");
  }

  return createPoliticaCobro(input);
}

export async function updatePoliticaCobroService(
  id: string,
  empresaId: string,
  input: {
    nombre?: string;
    tipoVencimiento?: TipoVencimiento;
    diaCorte?: number;
    diaVencimiento?: number;
    diasGracia?: number;
    aplicaMora?: boolean;
    tipoMora?: TipoMora;
    valorMora?: number;
  }
) {
  const politica = await findPoliticaById(id);

  if (!politica || politica.empresaId !== empresaId) {
    throw new Error("Política de cobro no encontrada");
  }

  if (input.nombre && input.nombre !== politica.nombre) {
    const existing = await findPoliticaByName(empresaId, input.nombre);

    if (existing) {
      throw new Error("Ya existe una política de cobro con ese nombre");
    }
  }

  const dataToUpdate = {
    ...input,
  };

  if (input.aplicaMora === false) {
    dataToUpdate.tipoMora = null as unknown as undefined;
    dataToUpdate.valorMora = null as unknown as undefined;
  }

  return updatePoliticaCobro(id, dataToUpdate);
}

export async function updatePoliticaCobroStatusService(
  id: string,
  empresaId: string,
  estado: EstadoRegistroBasico
) {
  const politica = await findPoliticaById(id);

  if (!politica || politica.empresaId !== empresaId) {
    throw new Error("Política de cobro no encontrada");
  }

  return updatePoliticaCobroStatus(id, estado);
}
