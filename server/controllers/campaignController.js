import { CampaignModel } from '../models/campaignModel.js';
import { ContactModel } from '../models/contactModel.js';
import { TemplateModel } from '../models/templateModel.js';
import { sendWhatsappMessage } from '../utils/whatsappService.js';
import { WhatsappMessageModel } from '../models/whatsappMessageModel.js';
import { FailedNumber } from '../models/failednumberModel.js';

import { processCampaign } from '../utils/campaignService.js';

export const createCampaign = async (req, res) => {
  try {
    const { name, templateId, contacts, mappings, scheduledAt } = req.body;

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
    const phoneColumn = mappings?.phoneNumber || 'phone'; 
    
    // Transform contacts for DB
    const dbContacts = contacts.map(row => {
        let phone = String(row[phoneColumn] || '').replace(/[^0-9]/g, '');
        if (phone.length === 10) {
            phone = '91' + phone;
        }
        if (phone.length < 10) return null; 

        return {
            phone_number: phone,
            name: row['name'] || row['Name'] || '',
            custom_attributes: row 
        };
    }).filter(Boolean);

    if (dbContacts.length === 0) {
        return res.status(400).json({ error: "No valid contacts found (check phone number column)." });
    }

    // Filter duplicates/failed logic (retained)
    const allPhones = dbContacts.map(c=>c.phone_number);
    let validContacts = [...dbContacts];
    if (allPhones.length > 0){
        const failedNumbers = await FailedNumber.checkExists(allPhones);
        if (failedNumbers.length > 0){
            validContacts = dbContacts.filter(c => !failedNumbers.includes(c.phone_number));
        }
    }
    
    if (validContacts.length === 0) {
        return res.status(400).json({ error: "All contacts were filtered out as they are in the failed list." });
    }

    await ContactModel.upsertMany(validContacts);

    // 4. Create Campaign
    const campaignStatus = scheduledAt ? 'scheduled' : 'processing';
    // Format scheduledAt to MySQL datetime if needed (ISO usually works if driver supports it, else use moment/date-fns)
    // Assuming ISO string "YYYY-MM-DDTHH:mm:ss.sssZ" passes fine or needs conversion. 
    // Best to convert to 'YYYY-MM-DD HH:mm:ss' local/UTC depending on server config.
    // Let's assume input is ISO and mysql2 handles it or we cast it. 
    const scheduleDate = scheduledAt ? new Date(scheduledAt) : null;

    const campaignId = await CampaignModel.create({
        name,
        template_id: templateId,
        status: campaignStatus,
        total_contacts: validContacts.length,
        scheduled_at: scheduleDate,
        mappings: mappings
    });

    // 5. Create Pending Logs
    // We need contact IDs.
    const contactPhones = validContacts.map(c => c.phone_number);
    const contactIds = await ContactModel.findIdsByPhones(contactPhones);
    // Create a map
    const phoneToId = new Map();
    contactIds.forEach(c => phoneToId.set(c.phone_number, c.id));

    const logs = [];
    validContacts.forEach(c => {
        const cid = phoneToId.get(c.phone_number);
        if (cid) {
            logs.push({
                campaign_id: campaignId,
                contact_id: cid,
                status: 'scheduled', // Use 'scheduled' as initial state
                message_id: null,
                error_details: null
            });
        }
    });

    await CampaignModel.createLogs(logs);

    // 6. Execute or Schedule
    if (scheduledAt) {
        res.status(201).json({ message: "Campaign scheduled successfully", campaignId });
    } else {
        // Run immediately
        const io = req.app.get('io');
        processCampaign(campaignId, io);
        res.status(201).json({ message: "Campaign launched successfully", campaignId });
    }

  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const validateContacts = async (req, res) => {
    try {
        const { contacts, phoneColumn } = req.body;
        if (!contacts || !Array.isArray(contacts)) {
            return res.status(400).json({ error: "Invalid contact list" });
        }

        const stats = {
            total: 0,
            valid: 0,
            failed_previously: 0,
            estimated_cost: 0
        };

        const col = phoneColumn || 'phone';
        const phoneList = contacts.map(c => {
             let p = String(c[col] || '').replace(/[^0-9]/g, '');
             if(p.length === 10) p = '91' + p;
             return p;
        }).filter(p => p.length >= 10);

        stats.total = phoneList.length;

        if (phoneList.length > 0) {
            const failedNumbers = await FailedNumber.checkExists(phoneList);
            stats.failed_previously = failedNumbers.length;
            stats.valid = stats.total - stats.failed_previously;
        } else {
            stats.valid = 0;
        }

        stats.estimated_cost = Number((stats.valid * 0.8631).toFixed(4));

        res.json(stats);
    } catch (error) {
        console.error("Validation error:", error);
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

export const getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await CampaignModel.findById(id);
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        // Fetch Real-time stats from whatsapp_messages
        const stats = await WhatsappMessageModel.getCampaignStats(id);
        
        // Merge stats with campaign object
        res.json({ ...campaign, realtime_stats: stats });
    } catch (error) {
        console.error("Error fetching campaign:", error);
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
