import { Router } from 'express';
import { dashboardCajeroController, dashboardOrdenesController } from './dashboard.controller';

const router = Router();

router.get('/cajero', dashboardCajeroController)
router.get('/ordenes', dashboardOrdenesController);

export default router;