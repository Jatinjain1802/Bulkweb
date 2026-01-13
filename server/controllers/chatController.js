import db from '../config/db.js';
import { WhatsappMessageModel } from '../models/whatsappMessageModel.js';
import { sendMessage } from '../utils/whatsappService.js';

export const getConversations = async (req, res) => {
  try {
    // Logic: Get distinct recipients/senders and their last message
    // This is a bit complex in SQL because recipient column is used for both (in our current schema we might need to unify).
    // Actually, `recipient` stores the phone number in `whatsapp_messages`.
    // For outbound: recipient = destination phone.
    // For incoming: recipient = sender phone (stored as 'from' in webhook, but mapped to `recipient` column in saveIncoming).
    
    // So distinct `recipient` is enough to get "conversations".
    
    const query = `
      SELECT 
        wm.recipient as phoneNumber,
        MAX(wm.sent_at) as lastMessageTime,
        (SELECT content FROM whatsapp_messages WHERE recipient = wm.recipient ORDER BY sent_at DESC LIMIT 1) as lastMessage,
        (SELECT COUNT(*) FROM whatsapp_messages WHERE recipient = wm.recipient AND direction = 'inbound' AND status != 'read') as unreadCount,
        c.name as contactName
      FROM whatsapp_messages wm
      LEFT JOIN contacts c ON wm.recipient = c.phone_number
      GROUP BY wm.recipient
      ORDER BY lastMessageTime DESC
    `;

    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getMessages = async (req, res) => {
  const { phoneNumber } = req.params;
  try {
    const query = `
      SELECT * 
      FROM whatsapp_messages 
      WHERE recipient = ? 
      ORDER BY sent_at ASC
    `;
    const [rows] = await db.execute(query, [phoneNumber]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendChatMessage = async (req, res) => {
    const { phoneNumber, message } = req.body;
    try {
        // Send via WhatsApp API
        const response = await sendMessage(phoneNumber, message);
        
        // Save to DB
        // sendMessage util usually returns the ID immediately or we handle it here.
        // If sendMessage doesn't save to DB, we should do it here. 
        // Typically sendMessage (util) calls the API. The webhook will eventually confirm it.
        // But for UI feedback, we should optimistically save or wait for response ID.
        
        const wamid = response.messages?.[0]?.id;
        if (wamid) {
             await WhatsappMessageModel.create({
                wamid,
                recipient: phoneNumber,
                content: message,
                message_type: 'text',
                direction: 'outbound',
                status: 'sent'
             });
        }

        res.json({ success: true, wamid });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
}
