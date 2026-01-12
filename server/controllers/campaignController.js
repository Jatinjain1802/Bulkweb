import { CampaignModel } from '../models/campaignModel.js';
import { ContactModel } from '../models/contactModel.js';
import { TemplateModel } from '../models/templateModel.js';
import { sendWhatsappMessage } from '../utils/whatsappService.js';

export const createCampaign = async (req, res) => {
  try {
    const { name, templateId, contacts, mappings } = req.body;

    // 1. Validate Input
    if (!name || !templateId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: "Invalid input. Name, templateId, and contacts list required." });
    }

    // 2. Fetch Template to get name/lang
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // 3. Upsert Contacts
    // contacts should be: [{ phone, ...otherFields }]
    // Filter duplicates within the uploaded file first? 
    // The user said "check by phone number" which ContactModel.upsertMany handles via DB.
    // Ensure contacts have 'phone_number' key. 
    // Frontend likely sends keys as per CSV headers. One must be mapped to 'phone_number'.
    // We expect frontend to tell us which column is phone number using 'mappings.phoneNumber'.

    const phoneColumn = mappings?.phoneNumber || 'phone'; // Default or mapped
    
    // Transform contacts for DB
    const start = Date.now();
    const dbContacts = contacts.map(row => {
        // Clean phone number (remove non-digits, maybe add country code if needed?
        // For now assume user provides clean numbers or we just strip +/spaces)
        let phone = String(row[phoneColumn] || '').replace(/[^0-9]/g, '');
        
        // If 10 digits, assume India and prepend 91
        if (phone.length === 10) {
            phone = '91' + phone;
        }
        
        // Basic validation
        if (phone.length < 10) return null; 

        return {
            phone_number: phone,
            name: row['name'] || row['Name'] || '', // Try to guess or leave empty
            custom_attributes: row // store everything
        };
    }).filter(Boolean);

    if (dbContacts.length === 0) {
        return res.status(400).json({ error: "No valid contacts found (check phone number column)." });
    }

    await ContactModel.upsertMany(dbContacts);

    // 4. Create Campaign
    const campaignId = await CampaignModel.create({
        name,
        template_id: templateId,
        status: 'processing',
        total_contacts: dbContacts.length
    });

    // 5. Start Sending in Background
    // We don't await this entire process to return the response
    (async () => {
        let successCount = 0;
        let failCount = 0;


        // Fetch IDs for all contacts to log properly
        const contactPhones = dbContacts.map(c => c.phone_number);
        const contactIdMap = new Map();
        try {
            // Chunking might be needed for very large lists, keeping simple for now
            if (contactPhones.length > 0) {
                 const rows = await ContactModel.findIdsByPhones(contactPhones);
                 rows.forEach(r => contactIdMap.set(r.phone_number, r.id));
            }
        } catch(e) { console.error("Error fetching contact IDs for logs:", e); }

        for (const contact of dbContacts) {
            const contactId = contactIdMap.get(contact.phone_number);
            try {
                // Construct Components
                const parameters = [];
                const varKeys = Object.keys(mappings).filter(k => !isNaN(k)).sort((a,b) => a-b);
                
                if (varKeys.length > 0) {
                     const folderParams = varKeys.map(k => {
                         const colName = mappings[k];
                         const val = contact.custom_attributes[colName] || '';
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

                successCount++;
                
                // Log Success
                if (contactId) {
                    await CampaignModel.logAttempt({
                        campaign_id: campaignId,
                        contact_id: contactId,
                        status: 'sent',
                        message_id: sentMsg?.id || 'mock_id',
                        error_details: null
                    });
                }

            } catch (err) {
                console.error(`Failed to send to ${contact.phone_number}:`, err.message);
                failCount++;
                
                // Log Failure
                if (contactId) {
                    await CampaignModel.logAttempt({
                        campaign_id: campaignId,
                        contact_id: contactId,
                        status: 'failed',
                        message_id: null,
                        error_details: err.message
                    });
                }
            }
        }

        // Update Final Stats
        await CampaignModel.updateStats(campaignId, successCount, failCount);
        
        const finalStatus = failCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'failed');
        await CampaignModel.updateStatus(campaignId, finalStatus);
        
    })();

    res.status(201).json({ message: "Campaign launched successfully", campaignId });

  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignModel.findAll();
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const getCampaignLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const logs = await CampaignModel.findLogsByCampaignId(id);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
