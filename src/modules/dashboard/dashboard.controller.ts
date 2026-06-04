import { Request, Response } from 'express';
import { getDashboardCajero } from './cajero/cajero-dashboard.service';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validarFecha(valor: unknown, campo: string): string | null {
    if (typeof valor !== 'string' || !ISO_DATE_RE.test(valor)) {
        return `${campo} debe tener formato YYYY-MM-DD`;
    }
    return null;
}

export async function dashboardCajeroController(
    req: Request,
    res: Response,
): Promise<void> {
    const empresaId = (req.query.empresaId as string) ?? (req as any).user?.empresaId;

    if (!empresaId) {
        res.status(400).json({ error: 'empresaId es requerido' });
        return;
    }

    const { fechaDesde, fechaHasta } = req.query;

    if (fechaDesde !== undefined) {
        const error = validarFecha(fechaDesde, 'fechaDesde');
        if (error) { res.status(400).json({ error }); return; }
    }

    if (fechaHasta !== undefined) {
        if (fechaDesde === undefined) {
            res.status(400).json({ error: 'fechaDesde es requerido cuando se especifica fechaHasta' });
            return;
        }
        const error = validarFecha(fechaHasta, 'fechaHasta');
        if (error) { res.status(400).json({ error }); return; }

        if ((fechaDesde as string) > (fechaHasta as string)) {
            res.status(400).json({ error: 'fechaDesde no puede ser mayor que fechaHasta' });
            return;
        }
    }

    const data = await getDashboardCajero(
        empresaId,
        fechaDesde as string | undefined,
        fechaHasta as string | undefined,
    );
    res.status(200).json(data);
}
