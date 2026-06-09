import { Router } from 'express';
import { hydrationController } from './hydration.controller';
import { validate } from '../../middleware/validate.middleware';
import { createHydrationSchema, createTemplateSchema, updateTemplateSchema } from './hydration.schema';

const router = Router();
router.get('/', hydrationController.getLogs);
router.post('/', validate(createHydrationSchema), hydrationController.createLog);
router.delete('/:id', hydrationController.removeLog);
router.get('/templates', hydrationController.getTemplates);
router.post('/templates', validate(createTemplateSchema), hydrationController.createTemplate);
router.patch('/templates/:id', validate(updateTemplateSchema), hydrationController.updateTemplate);
router.delete('/templates/:id', hydrationController.removeTemplate);
router.get('/weather-goal', hydrationController.getWeatherGoal);
export default router;
