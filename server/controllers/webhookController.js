import { WhatsappMessageModel } from '../models/whatsappMessageModel.js';
import { FailedNumber } from '../models/failednumberModel.js';
import { TemplateModel } from '../models/templateModel.js';

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

        const io = req.app.get('io');

        if (statuses && Array.isArray(statuses)) {
            for (const statusObj of statuses) {
                const wamid = statusObj.id;
                const status = statusObj.status; // delivered, read, failed
                const timestamp = statusObj.timestamp; 
                
                await WhatsappMessageModel.updateStatus(wamid, status, timestamp);

                if (io) {
                    io.emit('status_update', { 
                        wamid, 
                        status, 
                        timestamp,
                        recipient_id: statusObj.recipient_id 
                    });
                }

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
                  
                  if (io) {
                      io.emit('new_message', { 
                          wamid, 
                          from, 
                          content, 
                          type, 
                          timestamp 
                      });
                  }

                } catch (err) {
                  // Ignore duplicate entry errors (common with retries)
                  if (err.code !== 'ER_DUP_ENTRY') {
                    console.error("Error saving incoming message:", err);
                  }
                }
                }
        }

        // Handle Template Status Updates
        if (changes && changes.field === 'message_template_status_update') {
            const event = changes.value;
            const metaId = event.message_template_id;
            const status = event.event; // APPROVED, REJECTED, PENDING, PAUSED, DISABLED, FLAGGED
            const reason = event.reason;
            const name = event.message_template_name;

            console.log(`Template webhook: ${name} (${metaId}) -> ${status}`);

            // Map status
            const mapStatus = (s) => {
                switch (s) {
                    case 'APPROVED': return 'approved';
                    case 'REJECTED': return 'rejected';
                    case 'PENDING': return 'pending';
                    case 'PAUSED': return 'paused';
                    case 'DISABLED': return 'disabled';
                    case 'FLAGGED': return 'flagged';
                    default: return s.toLowerCase();
                }
            };

            const distinctStatus = mapStatus(status);

            // Update DB
            let template = await TemplateModel.findByMetaId(metaId);
            if (!template && name) {
                // Fallback to name if not found by ID (e.g. if ID wasn't saved yet)
                template = await TemplateModel.findByName(name);
            }

            if (template) {
                await TemplateModel.updateSyncDetails(template.id, {
                    status: distinctStatus,
                    meta_id: metaId,
                    rejection_reason: reason
                });

                if (io) {
                    io.emit('template_status_update', {
                        id: template.id,
                        name: template.name,
                        status: distinctStatus,
                        reason: reason,
                        timestamp: Date.now()
                    });
                }
            } else {
                console.log("Template not found locally for status update:", name);
            }
        }
        }

    
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
};
