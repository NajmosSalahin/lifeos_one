import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sleepService } from './sleep.service';

export const sleepController = {
  async getAll(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await sleepService.getAll(req.userId!) });
  },
  async getById(req: AuthRequest, res: Response) {
    const log = await sleepService.getById(req.userId!, req.params.id);
    if (!log) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sleep log not found' } }); return; }
    res.json({ success: true, data: log });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await sleepService.create(req.userId!, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    await sleepService.update(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },
  async remove(req: AuthRequest, res: Response) {
    await sleepService.remove(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
};
