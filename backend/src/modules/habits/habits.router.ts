import { Router } from 'express';
import { habitsController } from './habits.controller';
import { validate } from '../../middleware/validate.middleware';
import { createHabitSchema, updateHabitSchema, createHabitLogSchema } from './habits.schema';

const router = Router();

router.get('/', habitsController.getAll);
router.post('/', validate(createHabitSchema), habitsController.create);
router.get('/:id', habitsController.getById);
router.patch('/:id', validate(updateHabitSchema), habitsController.update);
router.delete('/:id', habitsController.remove);
router.patch('/:id/archive', habitsController.archive);
router.get('/:id/logs', habitsController.getLogs);
router.post('/:id/logs', validate(createHabitLogSchema), habitsController.createLog);
router.delete('/:id/logs/:logId', habitsController.removeLog);

export default router;
