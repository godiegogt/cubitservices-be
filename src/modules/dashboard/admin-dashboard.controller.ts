import { Request, Response } from "express";
import { dashboardQuerySchema } from "./admin-dashboard.schema";
import { getAdminDashboard } from "./admin-dashboard.service";

export async function getAdminDashboardHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const parsedQuery = dashboardQuerySchema.parse(req.query);
    const result = await getAdminDashboard(empresaId, parsedQuery);

    return res.json({
        success: true,
        message: "Dashboard obtenido correctamente",
        data: result,
    });
    } catch (error) {
    return res.status(400).json({
        success: false,
        message:
        error instanceof Error
            ? error.message
            : "Error obteniendo dashboard",
    });
    }
}
