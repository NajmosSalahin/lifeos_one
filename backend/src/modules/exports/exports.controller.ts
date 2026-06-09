import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { exportsService } from './exports.service';

export const exportsController = {
  async exportJson(req: AuthRequest, res: Response) {
    const data = await exportsService.exportJson(req.userId!);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="lifeos-export.json"');
    res.json(data);
  },

  async exportCsv(req: AuthRequest, res: Response) {
    const csv = await exportsService.exportCsv(req.userId!, req.params.module);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="lifeos-${req.params.module}.csv"`);
    res.send(csv);
  },

  async exportJournalMarkdown(req: AuthRequest, res: Response) {
    const md = await exportsService.exportJournalMarkdown(req.userId!);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="lifeos-journal.md"');
    res.send(md);
  },

  async exportPdfReport(req: AuthRequest, res: Response) {
    const content = await exportsService.exportPdfReport(req.userId!);
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  },
};
