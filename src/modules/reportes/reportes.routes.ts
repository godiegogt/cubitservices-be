import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import ordenesReportRoutes from "./ordenes/ordenes-report.routes";
import pagosReportRoutes from "./pagos/pagos-report.routes";
import clientesReportRoutes from "./clientes/clientes-report.routes";

const router = Router();

router.use(requireAuth);

router.use("/pagos", pagosReportRoutes);
router.use("/ordenes", ordenesReportRoutes);
router.use("/clientes", clientesReportRoutes);

export default router;