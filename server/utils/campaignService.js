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

        // Parse Template Structure
        let templateStructure = [];
        try {
            templateStructure = typeof template.structure === 'string' 
                ? JSON.parse(template.structure) 
                : template.structure;
        } catch (e) {
            console.error("Error parsing template structure", e);
        }

        // Identify Header Component in Template
        const headerComponent = templateStructure.find(c => c.type === 'HEADER');
        const hasMediaHeader = headerComponent && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format);

        let successCount = 0;
        let failCount = 0;

        for (const contact of pendingContacts) {
             try {
                // Construct Components
                const components = [];

                // 1. Handle Body Parameters ({{1}}, {{2}}, etc.)
                const parameters = [];
                // Mappings keys should be the variable indices (1, 2, ...)
                const varKeys = Object.keys(mappings || {}).filter(k => !isNaN(k)).sort((a,b) => a-b);
                
                if (varKeys.length > 0) {
                     const folderParams = varKeys.map(k => {
                         const colName = mappings[k];
                         const attrs = (typeof contact.custom_attributes === 'string') 
                            ? JSON.parse(contact.custom_attributes) 
                            : contact.custom_attributes;
                         
                         const val = attrs ? (attrs[colName] || '') : '';
                         return { type: "text", text: String(val) };
                     });
                     parameters.push(...folderParams);
                }

                if (parameters.length > 0) {
                    components.push({ type: "body", parameters: parameters });
                }

                // 2. Handle Header Parameters (Media)
                let finalMediaUrl = null;
                let finalMediaId = null;

                if (hasMediaHeader) {
                    const headerParams = [];
                    const mediaType = headerComponent.format.toLowerCase(); // image, video, document
                    
                    // Priority 1: Check for explicit mapped URL (e.g., mappings['header_url'])
                    const mappedUrl = mappings['header_url'];
                    
                    // Priority 2: Use Template's Saved Local Media (Best fallback)
                    let savedMediaUrl = null;
                    if (template.sample_media_url) {
                         const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5000'; 
                         savedMediaUrl = `${baseUrl}/${template.sample_media_url}`;
                    }

                    // Priority 3: Use Template Example Handle (Fallback)
                    const exampleHandle = headerComponent.example?.header_handle?.[0];

                    if (mappedUrl) {
                        finalMediaUrl = mappedUrl;
                        const mediaObj = { link: mappedUrl };
                        // For documents, it's nice to send a filename
                        if (mediaType === 'document') {
                            const filename = mappedUrl.split('/').pop().split('?')[0] || 'document.pdf';
                            mediaObj.filename = filename;
                        }
                        headerParams.push({
                            type: mediaType,
                            [mediaType]: mediaObj
                        });
                    } else if (savedMediaUrl) {
                        finalMediaUrl = savedMediaUrl;
                         const mediaObj = { link: savedMediaUrl };
                        if (mediaType === 'document') {
                             // Extract filename from the local path if possible, or URL
                             const filename = template.sample_media_url.split('/').pop() || 'document.pdf';
                             mediaObj.filename = filename;
                        }
                        headerParams.push({
                            type: mediaType,
                            [mediaType]: mediaObj
                        });
                    } else if (exampleHandle) {
                        finalMediaId = exampleHandle;
                        headerParams.push({
                            type: mediaType,
                            [mediaType]: { id: exampleHandle }
                        });
                    } else {
                        console.warn(`Campaign ${campaignId}: Missing media for header.`);
                    }

                    if (headerParams.length > 0) {
                        components.push({ type: "header", parameters: headerParams });
                    }
                }

                // Send
                const sentMsg = await sendWhatsappMessage(
                    contact.phone_number,
                    template.name,
                    template.language,
                    components
                );

                // Reconstruct Message Content for DB (So it shows in Chat)
                let fullContent = '';
                
                // 1. Header
                if (headerComponent && headerComponent.format === 'TEXT') {
                   fullContent += `*${headerComponent.text}*\n\n`;
                } else if (hasMediaHeader && headerComponent.format) {
                   if (headerComponent.format === 'DOCUMENT') {
                       let filename = 'Document';
                       if (finalMediaUrl) {
                           filename = finalMediaUrl.split('/').pop().split('?')[0];
                       } else if (finalMediaId) {
                           filename = 'Overview.pdf'; // Fallback for handle
                       }
                       fullContent += `📄 ${filename}\n\n`;
                   } else {
                       fullContent += `[${headerComponent.format}]\n\n`;
                   }
                }

                // 2. Body
                const bodyComponent = templateStructure.find(c => c.type === 'BODY');
                if (bodyComponent) {
                    let bodyText = bodyComponent.text;
                    // Replace {{1}}, {{2}}...
                    // derived from 'parameters' array which maps to {{1}}, {{2}} in order
                    parameters.forEach((param, index) => {
                        // param is { type: "text", text: "..." }
                        // Replace all occurrences of {{index+1}}
                        bodyText = bodyText.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), param.text);
                    });
                    fullContent += bodyText;
                }

                // 3. Footer
                const footerComponent = templateStructure.find(c => c.type === 'FOOTER');
                if (footerComponent) {
                    fullContent += `\n\n_${footerComponent.text}_`;
                }

                if (sentMsg?.id) {
                    await WhatsappMessageModel.create({
                        wamid: sentMsg.id,
                        template_id: template.id,
                        template_name: template.name,
                        category: template.category,
                        recipient: contact.phone_number,
                        status: 'sent',
                        campaign_id: campaignId,
                        content: fullContent,
                        message_type: 'template',
                        media_url: finalMediaUrl // Save the media URL
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
                
                await FailedNumber.add(contact.phone_number, err.message, campaignId, template.name);
                
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
