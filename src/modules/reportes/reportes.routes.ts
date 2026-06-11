import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { reporteOrdenesHandler } from "./ordenes/ordenes-report.controller";
import { reportePagosHandler } from "./reportes.controller";

const router = Router();

router.use(requireAuth);

router.get("/pagos", reportePagosHandler);
router.get("/ordenes", reporteOrdenesHandler);

export default router;
