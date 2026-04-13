import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createRoleHandler,
  listRoles,
  updateRoleHandler,
  updateRoleStatusHandler,
} from "./roles.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listRoles);
router.post("/", createRoleHandler);
router.patch("/:id", updateRoleHandler);
router.patch("/:id/estado", updateRoleStatusHandler);

export default router;