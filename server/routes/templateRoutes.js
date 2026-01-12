import express from 'express';
import multer from 'multer';
import { createTemplate, getTemplates, deleteTemplate } from '../controllers/templateController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('headerMedia'), createTemplate);
router.get('/', getTemplates);
router.delete('/:id', deleteTemplate);

export default router;
