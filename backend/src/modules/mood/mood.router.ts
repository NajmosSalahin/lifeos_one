import { Router } from 'express';
import { moodController } from './mood.controller';
import { validate } from '../../middleware/validate.middleware';
import { createMoodSchema, updateMoodSchema } from './mood.schema';

const router = Router();
router.get('/', moodController.getAll);
router.post('/', validate(createMoodSchema), moodController.create);
router.get('/:id', moodController.getById);
router.patch('/:id', validate(updateMoodSchema), moodController.update);
router.delete('/:id', moodController.remove);
export default router;
