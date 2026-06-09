import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { moodService } from './mood.service';

export const moodController = {
  async getAll(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await moodService.getAll(req.userId!) });
  },
  async getById(req: AuthRequest, res: Response) {
    const mood = await moodService.getById(req.userId!, req.params.id);
    if (!mood) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mood log not found' } }); return; }
    res.json({ success: true, data: mood });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await moodService.create(req.userId!, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    await moodService.update(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },
  async remove(req: AuthRequest, res: Response) {
    await moodService.remove(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
};
