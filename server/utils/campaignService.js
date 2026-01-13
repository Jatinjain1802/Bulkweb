import { CampaignModel } from '../models/campaignModel.js';
import { ContactModel } from '../models/contactModel.js';
import { TemplateModel } from '../models/templateModel.js';
import { WhatsappMessageModel } from '../models/whatsappMessageModel.js';
import { FailedNumber } from '../models/failednumberModel.js';
import { sendWhatsappMessage } from './whatsappService.js';

export const processCampaign = async (campaignId) => {
    try {
        const campaign = await CampaignModel.findById(campaignId);
        if (!campaign) {
            console.error(`Campaign ${campaignId} not found`);
            return;
        }

        // If status is scheduled, update to processing
        if (campaign.status === 'scheduled') {
            await CampaignModel.updateStatus(campaignId, 'processing');
        }

        let mappings = campaign.mappings;
        if (typeof mappings === 'string') {
            try { mappings = JSON.parse(mappings); } catch (e) { mappings = {}; }
        }

        // Fetch pending contacts (those with 'scheduled' or 'pending' status in logs)
        // We need to ensure we add 'pending' status support in CampaignModel.getPendingContacts if not already there
        // Actually, let's just fetch all logs for this campaign that are not sent/failed?
        // Or assume the caller (scheduler or controller) sets them to 'scheduled'/'pending'.
        // The controller currently doesn't create logs initially. I WILL CHANGE THIS.
        // So we need to fetch contacts linked to this campaign via logs.
        
        // I need to ensure getPendingContacts queries for 'pending' OR 'scheduled'.
        // Let's assume we use 'scheduled' for now as the status in logs for future compatibility.
        // If "Instant", we can also just use 'scheduled' status in logs but trigger immediately.
        
        const pendingContacts = await CampaignModel.getPendingContacts(campaignId);
        
        if (!pendingContacts || pendingContacts.length === 0) {
            console.log(`No pending contacts for campaign ${campaignId}`);
            // Mark as completed if it was stuck
            await CampaignModel.updateStatus(campaignId, 'completed');
            return;
        }

        // Fetch Template
        const template = await TemplateModel.findById(campaign.template_id);
        if (!template) {
            console.error(`Template ${campaign.template_id} not found`);
             await CampaignModel.updateStatus(campaignId, 'failed');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const contact of pendingContacts) {
             try {
                // Construct Components
                const parameters = [];
                // Mappings keys should be the variable indices (1, 2, ...)
                const varKeys = Object.keys(mappings || {}).filter(k => !isNaN(k)).sort((a,b) => a-b);
                
                if (varKeys.length > 0) {
                     const folderParams = varKeys.map(k => {
                         const colName = mappings[k];
                         // contact.custom_attributes might be a string if fetched from DB? 
                         // Check ContactModel structure. It says JSON type in DB.
                         // mysql2 usually parses JSON columns automatically.
                         const attrs = (typeof contact.custom_attributes === 'string') 
                            ? JSON.parse(contact.custom_attributes) 
                            : contact.custom_attributes;
                         
                         const val = attrs ? (attrs[colName] || '') : '';
                         return { type: "text", text: String(val) };
                     });
                     parameters.push(...folderParams);
                }

                const components = [];
                if (parameters.length > 0) {
                    components.push({ type: "body", parameters: parameters });
                }

                // Send
                const sentMsg = await sendWhatsappMessage(
                    contact.phone_number,
                    template.name,
                    template.language,
                    components
                );

                if (sentMsg?.id) {
                    await WhatsappMessageModel.create({
                        wamid: sentMsg.id,
                        template_id: template.id,
                        template_name: template.name,
                        category: template.category,
                        recipient: contact.phone_number,
                        status: 'sent',
                        campaign_id: campaignId
                    });
                    
                    // Update Log
                    await CampaignModel.updateLogStatus(contact.log_id, 'sent', sentMsg.id, null);
                    successCount++;
                } else {
                    throw new Error("No Message ID returned");
                }

            } catch (err) {
                console.error(`Failed to send to ${contact.phone_number}:`, err.message);
                failCount++;
                
                await FailedNumber.add(contact.phone_number, err.message);
                
                // Update Log
                await CampaignModel.updateLogStatus(contact.log_id, 'failed', null, err.message);
            }
        }

        // Update Stats
        const totalCost = successCount * 0.8631; // Is this constant? It was in the controller.
        await CampaignModel.updateStats(campaignId, successCount, failCount, totalCost);
        
        const finalStatus = failCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'failed');
        await CampaignModel.updateStatus(campaignId, finalStatus);

    } catch (error) {
        console.error("Error processing campaign:", error);
    }
};
