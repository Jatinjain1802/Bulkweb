import cron from 'node-cron';
import { CampaignModel } from '../models/campaignModel.js';
import { processCampaign } from './campaignService.js';

const startScheduler = (io) => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Checking for scheduled campaigns...');
        try {
            const dueCampaigns = await CampaignModel.getDueCampaigns();
            
            if (dueCampaigns.length > 0) {
                console.log(`Found ${dueCampaigns.length} due campaigns.`);
                for (const campaign of dueCampaigns) {
                    console.log(`Starting campaign ${campaign.id} (${campaign.name})...`);
                    processCampaign(campaign.id, io); 
                }
            }
        } catch (error) {
            console.error('Error in campaign scheduler:', error);
        }
    });
    console.log('Campaign scheduler started.');
};

export default startScheduler;
