import { Request, Response } from 'express';
import { dashboardQuerySchema } from './pagos-dashboard.schema';
import { getPagosDashboard } from './pagos-dashboard.service';

export async function dashboardPagoController(req: Request, res: Response): Promise<void> {
    try {
        const empresaId = req.auth!.empresaId;
        const query = dashboardQuerySchema.parse(req.query);
        const data = await getPagosDashboard(empresaId, query);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error obteniendo dashboard',
        });
    }
}
