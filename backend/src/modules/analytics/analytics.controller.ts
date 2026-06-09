import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { analyticsService } from './analytics.service';

export const analyticsController = {
  async habits(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.habits(req.userId!) }); },
  async mood(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.mood(req.userId!) }); },
  async sleep(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.sleep(req.userId!) }); },
  async hydration(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.hydration(req.userId!) }); },
  async breathing(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.breathing(req.userId!) }); },
  async journal(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.journal(req.userId!) }); },
  async goals(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.goals(req.userId!) }); },
  async overview(req: AuthRequest, res: Response) { res.json({ success: true, data: await analyticsService.overview(req.userId!) }); },
};
