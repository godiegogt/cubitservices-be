export interface CajeroDashBoardResponse {
    kpis: {
        totalCobradoHoy: number;
        pagosRegistrados: number;
        diferenciaCaja: number;
    }

    cobroPorMetodoPago: {
        metodo: string;
        total: number;
    }[];

    pagosDia: {
        id: string;
        fecha: Date;
        cliente: string;
        monto: number;
        metodoPago: string;
        usuario: string;
    }[];
}