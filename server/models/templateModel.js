import db from '../config/db.js';

export const TemplateModel = {
  create: async (templateData) => {
    const { name, language, category, structure, status, meta_id } = templateData;
    const query = `
      INSERT INTO templates (name, language, category, structure, status, meta_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // safe stringify
    let structureStr;
    try {
        structureStr = (typeof structure === 'object') ? JSON.stringify(structure) : String(structure || '[]');
    } catch (e) {
        structureStr = '[]';
    }

    const values = [
      name || null, 
      language || null, 
      category || null, 
      structureStr, 
      status || 'local_pending', 
      meta_id || null
    ];
    
    console.log("DB Insert Debug:", values); // Debugging line

    const [result] = await db.execute(query, values);
    return result.insertId;
  },

  findAll: async () => {
    const query = 'SELECT * FROM templates ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  },

  findById: async (id) => {
    const query = 'SELECT * FROM templates WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  findByName: async (name) => {
    const query = 'SELECT * FROM templates WHERE name = ?';
    const [rows] = await db.execute(query, [name]);
    return rows[0];
  },

  updateStatus: async (id, status, meta_id = null) => {
    let query = 'UPDATE templates SET status = ? WHERE id = ?';
    let params = [status, id];

    if (meta_id) {
      query = 'UPDATE templates SET status = ?, meta_id = ? WHERE id = ?';
      params = [status, meta_id, id];
    }
    
    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  },

  updateCategory: async (id, category) => {
    const query = 'UPDATE templates SET category = ? WHERE id = ?';
    const [result] = await db.execute(query, [category, id]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const query = 'DELETE FROM templates WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
};
