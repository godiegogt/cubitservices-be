import { Router } from 'express';
import { dashboardCajeroController } from './dashboard.controller';

const router = Router();

router.get('/cajero', dashboardCajeroController)

export default router;