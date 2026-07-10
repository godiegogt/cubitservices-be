import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { getEstadoCuenta } from './estado-cuenta.service';
import { generarExcel, generarPdf } from './estado-cuenta-export.service';
import { estadoCuentaQuerySchema, filtrosSchema } from './estado-cuenta.schemas';

const ERRORES_NO_ENCONTRADO = ['Cuenta de servicio no encontrada'];

function handleEstadoCuentaError(res: Response, error: unknown, defaultMessage: string) {
    if (error instanceof ZodError) {
    return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.issues,
    });
    }

    if (error instanceof Error && ERRORES_NO_ENCONTRADO.includes(error.message)) {
    return res.status(404).json({
        success: false,
        message: error.message,
    });
    }

    return res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
    });
}

export async function getEstadoCuentaHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { cuentaServicioId } = req.params;
    const filtros = estadoCuentaQuerySchema.parse(req.query);

    const estadoCuenta = await getEstadoCuenta(cuentaServicioId, empresaId, {
        ...filtros,
        page: filtros.page ?? 1,
        limit: filtros.limit ?? 10,
    });

    return res.json({
        success: true,
        message: 'Estado de cuenta obtenido correctamente',
        data: estadoCuenta,
    });
    } catch (error) {
    return handleEstadoCuentaError(res, error, 'Error obteniendo estado de cuenta');
    }
}

export async function exportPdfHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { cuentaServicioId } = req.params;
    const filtros = filtrosSchema.parse(req.query);

    const estadoCuenta = await getEstadoCuenta(cuentaServicioId, empresaId, filtros);
    const buffer = await generarPdf(estadoCuenta);

    const filename = `estado-cuenta-${estadoCuenta.cuenta.cuentaServicio.codigo}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
    } catch (error) {
    return handleEstadoCuentaError(res, error, 'Error exportando PDF');
    }
}

export async function exportExcelHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { cuentaServicioId } = req.params;
    const filtros = filtrosSchema.parse(req.query);

    const estadoCuenta = await getEstadoCuenta(cuentaServicioId, empresaId, filtros);
    const buffer = await generarExcel(estadoCuenta);

    const filename = `estado-cuenta-${estadoCuenta.cuenta.cuentaServicio.codigo}.xlsx`;

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
    } catch (error) {
    return handleEstadoCuentaError(res, error, 'Error exportando Excel');
    }
}
