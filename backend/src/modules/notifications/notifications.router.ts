import { Router } from 'express';
import { notificationsController } from './notifications.controller';

const router = Router();
router.get('/', notificationsController.getAll);
router.patch('/:id/read', notificationsController.markRead);
router.patch('/read-all', notificationsController.markAllRead);
export default router;
