import { Request, Response } from 'express';
import { getDashboardCajero } from './cajero/cajero-dashboard.service';

export async function dashboardCajeroController(
    req: Request,
    res: Response,
): Promise<void> {
    const empresaId = (req.query.empresaId as string) ?? (req as any).user?.empresaId;

    if (!empresaId) {
    res.status(400).json({ error: 'empresaId es requerido' });
    return;
    }

    const data = await getDashboardCajero(empresaId);
    res.status(200).json(data);
}