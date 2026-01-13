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
        const messages = value?.messages;

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

        if (messages && Array.isArray(messages)) {
            for (const msg of messages) {
                const wamid = msg.id;
                const from = msg.from; // Phone number
                const timestamp = msg.timestamp;
                const type = msg.type;
                
                let content = '';
                if (type === 'text') {
                    content = msg.text.body;
                } else {
                    // Handle other types as needed (image, etc)
                    content = `[${type} message]`;
                }

                try {
                  await WhatsappMessageModel.saveIncoming({
                    wamid,
                    from,
                    content,
                    message_type: type,
                    timestamp
                  });
                  console.log(`Saved incoming message from ${from}`);
                } catch (err) {
                  // Ignore duplicate entry errors (common with retries)
                  if (err.code !== 'ER_DUP_ENTRY') {
                    console.error("Error saving incoming message:", err);
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
