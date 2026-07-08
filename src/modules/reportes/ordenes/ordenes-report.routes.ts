import { Router } from "express";
import {
    reporteOrdenesHandler,
    exportOrdenesExcelHandler,
    exportOrdenesPdfHandler,
} from "./ordenes-report.controller";

const router = Router();

router.get("/", reporteOrdenesHandler);
router.get("/export/excel", exportOrdenesExcelHandler);
router.get("/export/pdf", exportOrdenesPdfHandler);

export default router;
