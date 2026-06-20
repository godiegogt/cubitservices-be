import { Request, Response } from 'express';
import { ordenesDashboardQuerySchema } from './ordenes-dashboard.schema';
import { getOrdenesDashboard } from './ordenes-dashboard.service';

export async function dashboardOrdenesController(req: Request, res: Response): Promise<void> {
    try {
        const empresaId = req.auth!.empresaId;
        const query = ordenesDashboardQuerySchema.parse(req.query);
        const data = await getOrdenesDashboard(empresaId, query);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error obteniendo dashboard de ordenes',
        });
    }
}
