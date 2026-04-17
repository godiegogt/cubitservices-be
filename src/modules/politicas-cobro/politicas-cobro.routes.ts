import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createPoliticaCobroHandler,
  listPoliticasCobro,
  updatePoliticaCobroHandler,
  updatePoliticaCobroStatusHandler,
} from "./politicas-cobro.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listPoliticasCobro);
router.post("/", createPoliticaCobroHandler);
router.patch("/:id", updatePoliticaCobroHandler);
router.patch("/:id/estado", updatePoliticaCobroStatusHandler);

export default router;
