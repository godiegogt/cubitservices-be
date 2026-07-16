import { Router } from "express";
import {
    cobranzaReportHandler,
    exportPdfHandler,
    exportExcelHandler,
} from "./cobranza-report.controller";

const router = Router();

router.get("/", cobranzaReportHandler);
router.get("/export/pdf", exportPdfHandler);
router.get("/export/excel", exportExcelHandler);

export default router;
