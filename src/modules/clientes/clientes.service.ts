import {
  EstadoRegistroBasico,
  TipoCliente,
  TipoIdentificacion,
} from "@prisma/client";
import {
  createCliente,
  findClienteByCodigo,
  findClienteById,
  findClientesByEmpresa,
  getCuentasByClient,
  getPagosByClient,
  updateCliente,
  updateClienteStatus,
} from "./clientes.repository";

export async function getClientes(empresaId: string) {
  return findClientesByEmpresa(empresaId);
}

export async function getClienteByIdService(id: string, empresaId: string) {
  const cliente = await findClienteById(id);

  if (!cliente || cliente.empresaId !== empresaId) {
    throw new Error("Cliente no encontrado");
  }

  const [pagos, cuentasServicio] = await Promise.all([
    getPagosByClient(id),
    getCuentasByClient(id),
  ]);

  return { ...cliente, pagos, cuentasServicio };
}

export async function createClienteService(input: {
  empresaId: string;
  codigo: string;
  tipoCliente: TipoCliente;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombreRazonSocial: string;
  nombreComercial?: string;
  tipoIdentificacion?: TipoIdentificacion;
  identificacion?: string;
  telefono?: string;
  email?: string;
  direccionFiscal?: string;
  observaciones?: string;
}) {
  const existing = await findClienteByCodigo(input.empresaId, input.codigo);

  if (existing) {
    throw new Error("Ya existe un cliente con ese código");
  }

  return createCliente(input);
}

export async function updateClienteService(
  id: string,
  empresaId: string,
  input: {
    tipoCliente?: TipoCliente;
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    nombreRazonSocial?: string;
    nombreComercial?: string;
    tipoIdentificacion?: TipoIdentificacion;
    identificacion?: string;
    telefono?: string;
    email?: string;
    direccionFiscal?: string;
    observaciones?: string;
  }
) {
  const cliente = await findClienteById(id);

  if (!cliente || cliente.empresaId !== empresaId) {
    throw new Error("Cliente no encontrado");
  }

  return updateCliente(id, input);
}

export async function updateClienteStatusService(
  id: string,
  empresaId: string,
  estado: EstadoRegistroBasico
) {
  const cliente = await findClienteById(id);

  if (!cliente || cliente.empresaId !== empresaId) {
    throw new Error("Cliente no encontrado");
  }

  return updateClienteStatus(id, estado);
}