import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { hydrationService } from './hydration.service';

export const hydrationController = {
  async getLogs(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await hydrationService.getLogs(req.userId!) });
  },
  async createLog(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await hydrationService.createLog(req.userId!, req.body) });
  },
  async removeLog(req: AuthRequest, res: Response) {
    await hydrationService.removeLog(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
  async getTemplates(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await hydrationService.getTemplates(req.userId!) });
  },
  async createTemplate(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await hydrationService.createTemplate(req.userId!, req.body) });
  },
  async updateTemplate(req: AuthRequest, res: Response) {
    await hydrationService.updateTemplate(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },
  async removeTemplate(req: AuthRequest, res: Response) {
    await hydrationService.removeTemplate(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
  async getWeatherGoal(req: AuthRequest, res: Response) {
    const { lat, lng } = req.query as unknown as { lat: number; lng: number };
    const data = await hydrationService.getWeatherGoal(req.userId!, Number(lat), Number(lng));
    res.json({ success: true, data });
  },
};
