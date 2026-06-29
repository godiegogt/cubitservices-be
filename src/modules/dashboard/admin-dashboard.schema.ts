import { z } from "zod";

export const dashboardQuerySchema = z.object({
    fechaDesde: z.string().date().optional(),
    fechaHasta: z.string().date().optional(),
    zona: z.coerce.number().int().optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
