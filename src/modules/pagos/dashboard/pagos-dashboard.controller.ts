import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { dashboardQuerySchema } from './pagos-dashboard.schema';
import { getPagosDashboard } from './pagos-dashboard.service';

export async function dashboardPagoController(req: Request, res: Response): Promise<void> {
    try {
        if (!req.auth) {
            res.status(401).json({
                success: false,
                message: 'No autenticado',
            });
            return;
        }
        const empresaId = req.auth.empresaId;
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
        if (error instanceof Prisma.PrismaClientInitializationError) {
            console.error('Error de conexión a la base de datos:', error);
            res.status(503).json({
                success: false,
                message: 'Servicio no disponible, intente más tarde',
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
