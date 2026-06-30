import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { dashboardQuerySchema } from './pagos-dashboard.schema';
import { getPagosDashboard } from './pagos-dashboard.service';

export async function dashboardPagoController(req: Request, res: Response): Promise<void> {
    try {
        const empresaId = req.auth!.empresaId;
        const query = dashboardQuerySchema.parse(req.query);
        const data = await getPagosDashboard(empresaId, query);
        res.json({ success: true, data });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        console.error('Error obteniendo dashboard de pagos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo dashboard',
        });
    }
}
