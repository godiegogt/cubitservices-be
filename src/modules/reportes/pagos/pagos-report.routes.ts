import { Router } from "express";
import {
    reportePagosHandler,
    exportPdfHandler,
    exportExcelHandler,
} from "./pagos-report.controller";

const router = Router();

router.get("/", reportePagosHandler);
router.get("/export/pdf", exportPdfHandler);
router.get("/export/excel", exportExcelHandler);

export default router;
