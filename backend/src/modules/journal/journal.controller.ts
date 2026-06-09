import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { journalService } from './journal.service';

export const journalController = {
  async getAll(req: AuthRequest, res: Response) {
    res.json({ success: true, data: await journalService.getAll(req.userId!) });
  },
  async getById(req: AuthRequest, res: Response) {
    const entry = await journalService.getById(req.userId!, req.params.id);
    if (!entry) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } }); return; }
    res.json({ success: true, data: entry });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ success: true, data: await journalService.create(req.userId!, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    await journalService.update(req.userId!, req.params.id, req.body);
    res.json({ success: true, data: null });
  },
  async remove(req: AuthRequest, res: Response) {
    await journalService.remove(req.userId!, req.params.id);
    res.json({ success: true, data: null });
  },
  async toggleFavorite(req: AuthRequest, res: Response) {
    const entry = await journalService.toggleFavorite(req.userId!, req.params.id);
    if (!entry) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } }); return; }
    res.json({ success: true, data: entry });
  },
  async search(req: AuthRequest, res: Response) {
    const q = req.query.q as string;
    if (!q) { res.json({ success: true, data: [] }); return; }
    res.json({ success: true, data: await journalService.search(req.userId!, q) });
  },
};
