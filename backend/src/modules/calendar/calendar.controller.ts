import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { calendarService } from './calendar.service';

export const calendarController = {
  async getMonth(req: AuthRequest, res: Response) {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid year or month' } });
      return;
    }
    res.json({ success: true, data: await calendarService.getMonth(req.userId!, year, month) });
  },
};
