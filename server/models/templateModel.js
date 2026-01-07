import db from '../config/db.js';

export const TemplateModel = {
  create: async (templateData) => {
    const { name, language, category, structure, status, meta_id } = templateData;
    const query = `
      INSERT INTO templates (name, language, category, structure, status, meta_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      name, 
      language, 
      category, 
      JSON.stringify(structure), 
      status || 'local', 
      meta_id || null
    ]);
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

  updateStatus: async (id, status, meta_id = null) => {
    let query = 'UPDATE templates SET status = ? WHERE id = ?';
    let params = [status, id];

    if (meta_id) {
      query = 'UPDATE templates SET status = ?, meta_id = ? WHERE id = ?';
      params = [status, meta_id, id];
    }
    
    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }
};
