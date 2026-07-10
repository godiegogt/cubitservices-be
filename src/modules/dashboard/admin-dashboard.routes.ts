import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { getAdminDashboardHandler } from "./admin-dashboard.controller";

const router = Router();

router.use(requireAuth);

router.get("/admin", getAdminDashboardHandler);

export default router;
