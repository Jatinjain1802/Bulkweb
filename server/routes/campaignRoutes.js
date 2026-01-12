import express from 'express';
import { createCampaign, getCampaigns, getCampaignLogs } from '../controllers/campaignController.js';

const router = express.Router();

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/:id/logs', getCampaignLogs);

export default router;
