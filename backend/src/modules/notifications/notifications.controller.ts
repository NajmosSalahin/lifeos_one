import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { notificationsService } from './notifications.service';

export const notificationsController = {
  async getAll(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await notificationsService.getAll(req.userId!) });
  },
  async markRead(req: AuthRequest, res: Response) {
    await notificationsService.markRead(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
  async markAllRead(req: AuthRequest, res: Response) {
    await notificationsService.markAllRead(req.userId!);
    res.json({ success: true, data: null });
  },
};
