import { z } from "zod";

export const dashboardQuerySchema = z.object({
    fechaDesde: z.string().date().optional(),
    fechaHasta: z.string().date().optional(),
    zona: z.string().trim().min(1).optional(),
    aldea: z.string().trim().min(1).optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
