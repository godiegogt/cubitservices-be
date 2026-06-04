import { Router } from 'express';
import { cajeroDashboardController } from './dashboard.controller';

const router = Router();

router.get('/cajero', cajeroDashboardController)

export default router;