import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    const dbName = process.env.DB_NAME || 'bulkweb';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or exists.`);

    await connection.changeUser({ database: dbName });

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createUsersTable);
    console.log("Users table ready.");

    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        language VARCHAR(10) NOT NULL DEFAULT 'en_US',
        category VARCHAR(50) NOT NULL,
        structure JSON,
        status VARCHAR(50) DEFAULT 'local',
        meta_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createTemplatesTable);
    console.log("Templates table ready.");

    const createContactsTable = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(255),
        custom_attributes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createContactsTable);
    console.log("Contacts table ready.");

    const createCampaignsTable = `
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        template_id INT,
        status VARCHAR(50) DEFAULT 'draft',
        total_contacts INT DEFAULT 0,
        successful_sends INT DEFAULT 0,
        failed_sends INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
      )
    `;
    await connection.query(createCampaignsTable);
    console.log("Campaigns table ready.");

    const createCampaignLogsTable = `
      CREATE TABLE IF NOT EXISTS campaign_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT,
        contact_id INT,
        status VARCHAR(50),
        message_id VARCHAR(100),
        error_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createCampaignLogsTable);
    console.log("Campaign Logs table ready.");

    // Check for rejection_reason column
    const [columns] = await connection.query(`SHOW COLUMNS FROM templates LIKE 'rejection_reason'`);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE templates ADD COLUMN rejection_reason TEXT`);
      console.log("Added rejection_reason column to templates table.");
    }

    // Seed dummy user if not exists
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['demo@gmail.com']);
    if (rows.length === 0) {
      await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
        'Demo User',
        'demo@gmail.com',
        '1234567890', 
        'admin'
      ]);
      console.log("Seeded demo user.");
    } else {
        console.log("Demo user already exists.");
    }

  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await connection.end();
  }
}

initDb();
