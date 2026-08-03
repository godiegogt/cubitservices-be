export class CargoDuplicadoError extends Error {
  constructor(message = "Ya existe un cargo SERVICIO para ese periodo") {
    super(message);
    this.name = "CargoDuplicadoError";
  }
}
