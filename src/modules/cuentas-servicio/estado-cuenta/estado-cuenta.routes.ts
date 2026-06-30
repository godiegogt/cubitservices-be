import { Router } from 'express';
import {
    exportExcelHandler,
    exportPdfHandler,
    getEstadoCuentaHandler,
} from './estado-cuenta.controller';

const router = Router({ mergeParams: true });

router.get('/', getEstadoCuentaHandler);
router.get('/export/pdf', exportPdfHandler);
router.get('/export/excel', exportExcelHandler);

export default router;
