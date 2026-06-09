import { Router } from 'express';
import { journalController } from './journal.controller';
import { validate } from '../../middleware/validate.middleware';
import { createJournalSchema, updateJournalSchema } from './journal.schema';

const router = Router();
router.get('/', journalController.getAll);
router.post('/', validate(createJournalSchema), journalController.create);
router.get('/search', journalController.search);
router.get('/:id', journalController.getById);
router.patch('/:id', validate(updateJournalSchema), journalController.update);
router.delete('/:id', journalController.remove);
router.post('/:id/favorite', journalController.toggleFavorite);
export default router;
