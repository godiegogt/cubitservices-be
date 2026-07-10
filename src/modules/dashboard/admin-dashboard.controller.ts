import { Request, Response } from "express";
import { ZodError } from "zod";
import { dashboardQuerySchema } from "./admin-dashboard.schema";
import { getAdminDashboard } from "./admin-dashboard.service";

export async function getAdminDashboardHandler(req: Request, res: Response) {
    try {
    if (!req.auth) {
        return res.status(401).json({
            success: false,
            message: "No autenticado",
        });
    }

    const empresaId = req.auth.empresaId;
    const parsedQuery = dashboardQuerySchema.parse(req.query);
    const result = await getAdminDashboard(empresaId, parsedQuery);

    return res.json({
        success: true,
        message: "Dashboard obtenido correctamente",
        data: result,
    });
    } catch (error) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Parámetros de consulta inválidos",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    return res.status(500).json({
        success: false,
        message:
        error instanceof Error
            ? error.message
            : "Error obteniendo dashboard",
    });
    }
}
