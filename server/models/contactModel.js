import db from '../config/db.js';

export const ContactModel = {
  upsertMany: async (contacts) => {
    // contacts: [{ phone_number, name, custom_attributes }]
    if (!contacts || contacts.length === 0) return;

    // We use INSERT ... ON DUPLICATE KEY UPDATE to handle "check by phone number"
    const query = `
      INSERT INTO contacts (phone_number, name, custom_attributes)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        custom_attributes = VALUES(custom_attributes)
    `;

    const values = contacts.map(c => [
      c.phone_number,
      c.name,
      JSON.stringify(c.custom_attributes || {})
    ]);

    const [result] = await db.query(query, [values]);
    return result;
  },

  findByPhone: async (phone) => {
    const [rows] = await db.execute('SELECT * FROM contacts WHERE phone_number = ?', [phone]);
    return rows[0];
  },
  
  // Helper to get IDs for a list of phones (to link to campaign logs)
  findIdsByPhones: async (phones) => {
      if (phones.length === 0) return [];
      const placeholders = phones.map(() => '?').join(',');
      const [rows] = await db.query(`SELECT id, phone_number FROM contacts WHERE phone_number IN (${placeholders})`, phones);
      return rows;
  }
};
