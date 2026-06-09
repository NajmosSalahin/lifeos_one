import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { userService } from './user.service';

export const userController = {
  async getProfile(req: AuthRequest, res: Response) {
    const profile = await userService.getProfile(req.userId!);
    res.json({ success: true, data: profile });
  },

  async updateProfile(req: AuthRequest, res: Response) {
    const profile = await userService.updateProfile(req.userId!, req.body);
    res.json({ success: true, data: profile });
  },

  async getPreferences(req: AuthRequest, res: Response) {
    const prefs = await userService.getPreferences(req.userId!);
    res.json({ success: true, data: prefs });
  },

  async updatePreferences(req: AuthRequest, res: Response) {
    const prefs = await userService.updatePreferences(req.userId!, req.body);
    res.json({ success: true, data: prefs });
  },
};
