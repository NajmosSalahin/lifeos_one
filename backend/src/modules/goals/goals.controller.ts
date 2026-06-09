import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { goalsService } from './goals.service';

export const goalsController = {
  async getAll(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await goalsService.getAll(req.userId!) });
  },
  async getById(req: AuthRequest, res: Response) {
    const goal = await goalsService.getById(req.userId!, req.params.id);
    if (!goal) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } }); return; }
    res.json({ success: true, data: goal });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await goalsService.create(req.userId!, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    await goalsService.update(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },
  async remove(req: AuthRequest, res: Response) {
    await goalsService.remove(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
  async createMilestone(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await goalsService.createMilestone(req.userId!, req.params.id, req.body) });
  },
  async updateMilestone(req: AuthRequest, res: Response) {
    await goalsService.updateMilestone(req.userId!, req.params.id, req.params.milestoneId, req.body);
    res.json({ success: true, data: null });
  },
  async removeMilestone(req: AuthRequest, res: Response) {
    await goalsService.removeMilestone(req.userId!, req.params.id, req.params.milestoneId);
    res.json({ success: true, data: null });
  },
};
