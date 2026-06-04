import { Request, Response } from 'express';
import { getDashboardCajero } from './cajero/cajero-dashboard.service';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function dashboardCajeroController(
    req: Request,
    res: Response,
): Promise<void> {
    const empresaId = (req.query.empresaId as string) ?? (req as any).user?.empresaId;

    if (!empresaId) {
        res.status(400).json({ error: 'empresaId es requerido' });
        return;
    }

    const fechaStr = req.query.fecha as string | undefined;
    if (fechaStr && !ISO_DATE_RE.test(fechaStr)) {
        res.status(400).json({ error: 'fecha debe tener formato YYYY-MM-DD' });
        return;
    }

    const data = await getDashboardCajero(empresaId, fechaStr);
    res.status(200).json(data);
}