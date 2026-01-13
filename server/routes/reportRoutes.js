import express from 'express';
import { getTemplateReports } from '../controllers/reportController.js';

const router = express.Router();

router.get('/templates', getTemplateReports);

export default router;
