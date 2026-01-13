import { WhatsappMessageModel } from '../models/whatsappMessageModel.js';
import { FailedNumber } from '../models/failednumberModel.js';

export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // User should set this in env. Defaulting for safety/demo if needed.
  const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
      res.sendStatus(400);
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const { body } = req;
    
    // Log incoming webhook for debug
    console.log("Received webhook:", JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const statuses = value?.statuses;

        if (statuses && Array.isArray(statuses)) {
            for (const statusObj of statuses) {
                const wamid = statusObj.id;
                const status = statusObj.status; // delivered, read, failed
                const timestamp = statusObj.timestamp; 
                
                await WhatsappMessageModel.updateStatus(wamid, status, timestamp);

                if (status === 'failed') {
                    const recipientId = statusObj.recipient_id;
                    const errorDetails = statusObj.errors?.[0]?.message || 'Unknown error from webhook';
                    if (recipientId) {
                        try {
                            await FailedNumber.add(recipientId, errorDetails);
                            console.log(`Added ${recipientId} to failed numbers via webhook.`);
                        } catch (err) {
                            console.error(`Error adding to failed numbers: ${err.message}`);
                        }
                    }
                }
            }
        }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
};
