import db from '../config/db.js';

export const TemplateModel = {
  create: async (templateData) => {
    const { name, language, category, structure, status, meta_id, rejection_reason, quality_score, stats } = templateData;
    
    // safe stringify
    let structureStr;
    try {
        structureStr = (typeof structure === 'object') ? JSON.stringify(structure) : String(structure || '[]');
    } catch (e) {
        structureStr = '[]';
    }

    // safe stringify for quality_score and stats
    const qualityScoreStr = (typeof quality_score === 'object') ? JSON.stringify(quality_score) : quality_score || null;
    const statsStr = (typeof stats === 'object') ? JSON.stringify(stats) : stats || null;

    const query = `
      INSERT INTO templates (name, language, category, structure, status, meta_id, rejection_reason, quality_score, stats)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name || null, 
      language || null, 
      category || null, 
      structureStr, 
      status || 'local_pending', 
      meta_id || null,
      rejection_reason || null,
      qualityScoreStr,
      statsStr
    ];
    
    console.log("DB Insert Debug:", values);

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

  updateStatus: async (id, status, meta_id = null, rejection_reason = null) => {
    let query = 'UPDATE templates SET status = ?';
    let params = [status];

    if (meta_id) {
      query += ', meta_id = ?';
      params.push(meta_id);
    }
    
    if (rejection_reason !== undefined) {
        query += ', rejection_reason = ?';
        params.push(rejection_reason);
    }

    query += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  },

  updateSyncDetails: async (id, updates) => {
      const { status, meta_id, rejection_reason, quality_score, stats } = updates;
      let query = 'UPDATE templates SET ';
      const params = [];
      const fields = [];

      if (status !== undefined) {
          fields.push('status = ?');
          params.push(status);
      }
      if (meta_id !== undefined) {
          fields.push('meta_id = ?');
          params.push(meta_id);
      }
      if (rejection_reason !== undefined) {
          fields.push('rejection_reason = ?');
          params.push(rejection_reason);
      }
      if (quality_score !== undefined) {
          fields.push('quality_score = ?');
          params.push(typeof quality_score === 'object' ? JSON.stringify(quality_score) : quality_score);
      }
      if (stats !== undefined) {
          fields.push('stats = ?');
          params.push(typeof stats === 'object' ? JSON.stringify(stats) : stats);
      }

      if (fields.length === 0) return false;

      query += fields.join(', ') + ' WHERE id = ?';
      params.push(id);

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
