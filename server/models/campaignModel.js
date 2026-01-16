import db from '../config/db.js';

export const CampaignModel = {
  create: async (campaignData) => {
    const { name, template_id, status, total_contacts, scheduled_at, mappings } = campaignData;
    const [result] = await db.execute(
      'INSERT INTO campaigns (name, template_id, status, total_contacts, scheduled_at, mappings) VALUES (?, ?, ?, ?, ?, ?)',
      [name, template_id, status || 'draft', total_contacts || 0, scheduled_at || null, mappings ? JSON.stringify(mappings) : null]
    );
    return result.insertId;
  },

  updateStats: async (id, successful_sends, failed_sends, cost = 0) => {
    // Increment stats and cost
    const [result] = await db.execute(
      `UPDATE campaigns 
       SET successful_sends = successful_sends + ?, 
           failed_sends = failed_sends + ?,
           cost = cost + ?
       WHERE id = ?`,
      [successful_sends, failed_sends, cost, id]
    );
    return result.affectedRows > 0;
  },
  
  updateStatus: async (id, status) => {
      const [result] = await db.execute('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
      return result.affectedRows > 0;
  },

  logAttempt: async (logData) => {
    const { campaign_id, contact_id, status, message_id, error_details } = logData;
    const [result] = await db.execute(
      `INSERT INTO campaign_logs (campaign_id, contact_id, status, message_id, error_details)
       VALUES (?, ?, ?, ?, ?)`,
      [campaign_id, contact_id, status, message_id, error_details]
    );
    return result.insertId;
  },

  createLogs: async (logs) => {
      if (!logs || logs.length === 0) return;
      
      const values = [];
      const placeholders = logs.map(log => {
          values.push(log.campaign_id, log.contact_id, log.status, log.message_id || null, log.error_details || null);
          return '(?, ?, ?, ?, ?)';
      }).join(', ');

      const query = `INSERT INTO campaign_logs (campaign_id, contact_id, status, message_id, error_details) VALUES ${placeholders}`;
      
      const [result] = await db.execute(query, values);
      return result.affectedRows;
  },
  
  findById: async (id) => {
      const [rows] = await db.execute(`
        SELECT c.*, 
               t.name as template_name, 
               t.quality_score as template_quality_score, 
               t.stats as template_stats,
               t.category as template_category,
               t.language as template_language,
               t.status as template_status
        FROM campaigns c 
        LEFT JOIN templates t ON c.template_id = t.id 
        WHERE c.id = ?
      `, [id]);
      return rows[0];
  },
  
  findAll: async () => {
      const [rows] = await db.execute(`
        SELECT c.*, 
               t.name as template_name,
               COUNT(wm.id) as real_sent_count,
               SUM(CASE WHEN wm.delivered_at IS NOT NULL THEN 1 ELSE 0 END) as real_delivered_count,
               SUM(CASE WHEN wm.status = 'failed' THEN 1 ELSE 0 END) as real_failed_count
        FROM campaigns c 
        LEFT JOIN templates t ON c.template_id = t.id 
        LEFT JOIN whatsapp_messages wm ON c.id = wm.campaign_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);
      return rows;
  },

  findLogsByCampaignId: async (campaignId) => {
      const query = `
        SELECT l.*, 
               COALESCE(wm.status, l.status) as status,
               c.name as contact_name, 
               c.phone_number 
        FROM campaign_logs l
        JOIN contacts c ON l.contact_id = c.id
        LEFT JOIN whatsapp_messages wm ON l.message_id = wm.wamid
        WHERE l.campaign_id = ?
        ORDER BY l.created_at DESC
      `;
      const [rows] = await db.execute(query, [campaignId]);
      return rows;
  },

  getDueCampaigns: async () => {
    const [rows] = await db.execute(`
        SELECT * FROM campaigns 
        WHERE status = 'scheduled' 
        AND scheduled_at <= NOW()
    `);
    return rows;
  },

  getPendingContacts: async (campaignId) => {
      // Get contacts from logs that are 'scheduled'
      const [rows] = await db.execute(`
        SELECT c.*, cl.id as log_id 
        FROM campaign_logs cl
        JOIN contacts c ON cl.contact_id = c.id
        WHERE cl.campaign_id = ? AND cl.status = 'scheduled'
      `, [campaignId]);
      return rows;
  },
  
  updateLogStatus: async (logId, status, messageId, errorDetails) => {
      const [result] = await db.execute(
          `UPDATE campaign_logs 
           SET status = ?, message_id = ?, error_details = ? 
           WHERE id = ?`,
          [status, messageId, errorDetails, logId]
      );
      return result.affectedRows > 0;
  }
};
