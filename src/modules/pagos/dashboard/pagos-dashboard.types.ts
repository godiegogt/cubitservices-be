export interface RawPagoReciente {
    id: string;
    fechaRegistro: Date;
    montoTotal: { toString(): string };
    referencia: string | null;
    estado: "REGISTRADO" | "CONFIRMADO" | "ANULADO";
    metodoPago: { nombre: string };
    cliente: { nombreRazonSocial: string };
    registradoBy: { nombres: string; apellidos: string | null };
}
