import { Router } from 'express';
import { exportsController } from './exports.controller';

const router = Router();
router.get('/json', exportsController.exportJson);
router.get('/csv/:module', exportsController.exportCsv);
router.get('/markdown/journal', exportsController.exportJournalMarkdown);
router.get('/pdf/report', exportsController.exportPdfReport);
export default router;
