import { Router } from 'express';
import { dashboardCajeroController, dashboardCajeroReporteController } from './dashboard.controller';

const router = Router();

router.get('/cajero', dashboardCajeroController)
router.get('/cajero/reporte', dashboardCajeroReporteController);

export default router;