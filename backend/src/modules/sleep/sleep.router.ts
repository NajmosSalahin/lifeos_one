import { Router } from 'express';
import { sleepController } from './sleep.controller';
import { validate } from '../../middleware/validate.middleware';
import { createSleepSchema, updateSleepSchema } from './sleep.schema';

const router = Router();
router.get('/', sleepController.getAll);
router.post('/', validate(createSleepSchema), sleepController.create);
router.get('/:id', sleepController.getById);
router.patch('/:id', validate(updateSleepSchema), sleepController.update);
router.delete('/:id', sleepController.remove);
export default router;
