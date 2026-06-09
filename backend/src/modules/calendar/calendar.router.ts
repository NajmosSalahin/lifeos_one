import { Router } from 'express';
import { calendarController } from './calendar.controller';

const router = Router();
router.get('/:year/:month', calendarController.getMonth);
export default router;
