import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { breathingService } from './breathing.service';

export const breathingController = {
  async getTechniques(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await breathingService.getTechniques(req.userId!) });
  },
  async createTechnique(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await breathingService.createTechnique(req.userId!, req.body) });
  },
  async updateTechnique(req: AuthRequest, res: Response) {
    await breathingService.updateTechnique(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },
  async removeTechnique(req: AuthRequest, res: Response) {
    await breathingService.removeTechnique(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
  async getSessions(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await breathingService.getSessions(req.userId!) });
  },
  async createSession(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await breathingService.createSession(req.userId!, req.body) });
  },
  async getTotalMindfulMinutes(req: AuthRequest, res: Response) {
    const minutes = await breathingService.getTotalMindfulMinutes(req.userId!);
    res.json({ success: true, data: { totalMindfulMinutes: minutes } });
  },
};
