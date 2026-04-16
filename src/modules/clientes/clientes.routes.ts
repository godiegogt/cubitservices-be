import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createClienteHandler,
  getClienteHandler,
  listClientes,
  updateClienteHandler,
  updateClienteStatusHandler,
} from "./clientes.controller";
import ubicacionesRouter from "../ubicaciones/ubicacion.routes";

const router = Router();

router.use(requireAuth);

router.get("/", listClientes);
router.get("/:id", getClienteHandler);
router.post("/", createClienteHandler);
router.patch("/:id", updateClienteHandler);
router.patch("/:id/estado", updateClienteStatusHandler);
router.use("/:clienteId/ubicaciones", ubicacionesRouter);

export default router;