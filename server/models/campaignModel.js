import db from '../config/db.js';

export const CampaignModel = {
  create: async (campaignData) => {
    const { name, template_id, status, total_contacts } = campaignData;
    const [result] = await db.execute(
      'INSERT INTO campaigns (name, template_id, status, total_contacts) VALUES (?, ?, ?, ?)',
      [name, template_id, status || 'draft', total_contacts || 0]
    );
    return result.insertId;
  },

  updateStats: async (id, successful_sends, failed_sends) => {
    // Increment stats
    const [result] = await db.execute(
      `UPDATE campaigns 
       SET successful_sends = successful_sends + ?, 
           failed_sends = failed_sends + ? 
       WHERE id = ?`,
      [successful_sends, failed_sends, id]
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
  
  findById: async (id) => {
      const [rows] = await db.execute('SELECT * FROM campaigns WHERE id = ?', [id]);
      return rows[0];
  },
  
  findAll: async () => {
      const [rows] = await db.execute(`
        SELECT c.*, t.name as template_name 
        FROM campaigns c 
        LEFT JOIN templates t ON c.template_id = t.id 
        ORDER BY c.created_at DESC
      `);
      return rows;
  },

  findLogsByCampaignId: async (campaignId) => {
      const query = `
        SELECT l.*, c.name as contact_name, c.phone_number 
        FROM campaign_logs l
        JOIN contacts c ON l.contact_id = c.id
        WHERE l.campaign_id = ?
        ORDER BY l.created_at DESC
      `;
      const [rows] = await db.execute(query, [campaignId]);
      return rows;
  }
};
