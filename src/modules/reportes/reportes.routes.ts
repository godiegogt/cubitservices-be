import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { reportePagosHandler } from "./reportes.controller";

const router = Router();

router.use(requireAuth);

router.get("/pagos", reportePagosHandler);

export default router;
