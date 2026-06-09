import { Router } from 'express';
import { goalsController } from './goals.controller';
import { validate } from '../../middleware/validate.middleware';
import { createGoalSchema, updateGoalSchema, createMilestoneSchema, updateMilestoneSchema } from './goals.schema';

const router = Router();
router.get('/', goalsController.getAll);
router.post('/', validate(createGoalSchema), goalsController.create);
router.get('/:id', goalsController.getById);
router.patch('/:id', validate(updateGoalSchema), goalsController.update);
router.delete('/:id', goalsController.remove);
router.post('/:id/milestones', validate(createMilestoneSchema), goalsController.createMilestone);
router.patch('/:id/milestones/:milestoneId', validate(updateMilestoneSchema), goalsController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', goalsController.removeMilestone);
export default router;
