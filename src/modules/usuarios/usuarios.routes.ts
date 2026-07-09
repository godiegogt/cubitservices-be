import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createUserHandler,
  listUsers,
  searchUsersHandler,
  updateUserHandler,
  updateUserStatusHandler,
} from "./usuarios.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listUsers);
router.get("/select", searchUsersHandler);
router.post("/", createUserHandler);
router.patch("/:id", updateUserHandler);
router.patch("/:id/estado", updateUserStatusHandler);

export default router;