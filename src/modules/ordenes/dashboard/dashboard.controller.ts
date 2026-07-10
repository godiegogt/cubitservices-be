import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ordenesDashboardQuerySchema } from './ordenes-dashboard.schema';
import { getOrdenesDashboard } from './ordenes-dashboard.service';

export async function dashboardOrdenesController(req: Request, res: Response): Promise<void> {
    try {
        const empresaId = req.auth!.empresaId;
        const query = ordenesDashboardQuerySchema.parse(req.query);
        const data = await getOrdenesDashboard(empresaId, query);
        res.json({ success: true, data });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        console.error('Error obteniendo dashboard de ordenes:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo dashboard de ordenes',
        });
    }
}
