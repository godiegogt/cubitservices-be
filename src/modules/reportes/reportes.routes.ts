import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import ordenesReportRoutes from "./ordenes/ordenes-report.routes";
// import pagosReportRoutes from "./pagos/pagos-report.routes";

const router = Router();

router.use(requireAuth);

router.use("/ordenes", ordenesReportRoutes);
// router.use("/pagos", pagosReportRoutes);

export default router;