import { Router } from 'express';
import { analyticsController } from './analytics.controller';

const router = Router();
router.get('/habits', analyticsController.habits);
router.get('/mood', analyticsController.mood);
router.get('/sleep', analyticsController.sleep);
router.get('/hydration', analyticsController.hydration);
router.get('/breathing', analyticsController.breathing);
router.get('/journal', analyticsController.journal);
router.get('/goals', analyticsController.goals);
router.get('/overview', analyticsController.overview);
export default router;
