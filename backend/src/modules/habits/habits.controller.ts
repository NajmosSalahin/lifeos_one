import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { habitsService } from './habits.service';

export const habitsController = {
  async getAll(req: AuthRequest, res: Response) {
    const habits = await habitsService.getAll(req.userId!);
    res.json({ success: true, data: habits });
  },

  async getById(req: AuthRequest, res: Response) {
    const habit = await habitsService.getById(req.userId!, req.params.id);
    if (!habit) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Habit not found' } }); return; }
    res.json({ success: true, data: habit });
  },

  async create(req: AuthRequest, res: Response) {
    const habit = await habitsService.create(req.userId!, req.body);
    res.status(201).json({ success: true, data: habit });
  },

  async update(req: AuthRequest, res: Response) {
    await habitsService.update(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },

  async remove(req: AuthRequest, res: Response) {
    await habitsService.remove(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },

  async archive(req: AuthRequest, res: Response) {
    await habitsService.archive(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },

  async getLogs(req: AuthRequest, res: Response) {
    const logs = await habitsService.getLogs(req.params.id);
    res.json({ success: true, data: logs });
  },

  async createLog(req: AuthRequest, res: Response) {
    const log = await habitsService.createLog(req.userId!, req.params.id, req.body);
    res.status(201).json({ success: true, data: log });
  },

  async removeLog(req: AuthRequest, res: Response) {
    await habitsService.removeLog(req.userId!, req.params.logId);
    res.json({ success: true, data: null });
  },
};
