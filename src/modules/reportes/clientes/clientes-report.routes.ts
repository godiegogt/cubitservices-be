import { Router } from "express";
import {
    reporteClientesHandler,
    exportClientesPdfHandler,
    exportClientesExcelHandler,
} from "./clientes-report.controller";

const router = Router();

router.get("/", reporteClientesHandler);
router.get("/export/pdf", exportClientesPdfHandler);
router.get("/export/excel", exportClientesExcelHandler);

export default router;
