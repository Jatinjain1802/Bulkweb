
import express from 'express';
import { getDashboardSummary, getAllActivities } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/activities', getAllActivities);

export default router;
