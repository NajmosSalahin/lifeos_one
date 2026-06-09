import { Router } from 'express';
import { breathingController } from './breathing.controller';
import { validate } from '../../middleware/validate.middleware';
import { createTechniqueSchema, updateTechniqueSchema, createSessionSchema } from './breathing.schema';

const router = Router();
router.get('/techniques', breathingController.getTechniques);
router.post('/techniques', validate(createTechniqueSchema), breathingController.createTechnique);
router.patch('/techniques/:id', validate(updateTechniqueSchema), breathingController.updateTechnique);
router.delete('/techniques/:id', breathingController.removeTechnique);
router.get('/sessions', breathingController.getSessions);
router.post('/sessions', validate(createSessionSchema), breathingController.createSession);
router.get('/mindful-minutes', breathingController.getTotalMindfulMinutes);
export default router;
