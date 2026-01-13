import db from '../config/db.js';

export const WhatsappMessageModel = {
  create: async (data) => {
    const { wamid, template_id, template_name, category, recipient, status, campaign_id } = data;
    const [result] = await db.execute(
      `INSERT INTO whatsapp_messages 
       (wamid, template_id, template_name, category, recipient, status, sent_at, campaign_id)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [wamid, template_id, template_name, category, recipient, status || 'sent', campaign_id || null]
    );
    return result.insertId;
  },

  updateStatus: async (wamid, status, timestamp) => {
    // timestamp is unix timestamp from Meta, usually.
    // We need to decide which column to update based on status.
    let colToUpdate = null;
    if (status === 'delivered') colToUpdate = 'delivered_at';
    if (status === 'read') colToUpdate = 'read_at';
    if (status === 'failed') colToUpdate = 'failed_at';

    if (!colToUpdate) return false;

    // Convert unix timestamp if needed, or use NOW() if not provided/reliable
    // Meta sends unix timestamp (seconds or millis? usually seconds).
    // Let's assume we use NOW() for simplicity unless we want strict event time.
    // User said "Update status and timestamp". 
    // Let's use FROM_UNIXTIME(?) if we pass the timestamp, or just NOW() if passed null.
    
    // Simplest approach: status update always sets the relevant timestamp to NOW() 
    // or we parse the incoming timestamp. 
    // Let's try to set the generic status column AND the specific timestamp column.
    
    const query = `UPDATE whatsapp_messages 
                   SET status = ?, ${colToUpdate} = NOW() 
                   WHERE wamid = ?`;
    
    const [result] = await db.execute(query, [status, wamid]);
    return result.affectedRows > 0;
  },

  getAnalytics: async (fromDate, toDate) => {
    const query = `
      SELECT 
        template_name as template,
        COUNT(*) as sent,
        SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as 'read',
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM whatsapp_messages
      WHERE sent_at BETWEEN ? AND ?
      GROUP BY template_name
    `;
    const [rows] = await db.execute(query, [fromDate, toDate]);
    return rows;
  },

  getCampaignStats: async (campaignId) => {
    const query = `
      SELECT 
        COUNT(*) as sent,
        SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as 'read',
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM whatsapp_messages
      WHERE campaign_id = ?
    `;
    const [rows] = await db.execute(query, [campaignId]);
    return rows[0];
  }
};
