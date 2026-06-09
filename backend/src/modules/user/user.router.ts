import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema, updatePreferencesSchema } from './user.schema';

const router = Router();

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.get('/preferences', userController.getPreferences);
router.patch('/preferences', validate(updatePreferencesSchema), userController.updatePreferences);

export default router;
