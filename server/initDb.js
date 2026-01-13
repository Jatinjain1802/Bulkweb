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
        successful_sends INT DEFAULT 0,
        failed_sends INT DEFAULT 0,
        cost DECIMAL(10, 4) DEFAULT 0.0000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
      )
    `;
    await connection.query(createCampaignsTable);
    console.log("Campaigns table ready.");

    // Check for cost column in campaigns
    const [campColumns] = await connection.query(`SHOW COLUMNS FROM campaigns LIKE 'cost'`);
    if (campColumns.length === 0) {
      await connection.query(`ALTER TABLE campaigns ADD COLUMN cost DECIMAL(10, 4) DEFAULT 0.0000`);
      console.log("Added cost column to campaigns table.");
    }

    // Check for scheduled_at column
    const [schedColumns] = await connection.query(`SHOW COLUMNS FROM campaigns LIKE 'scheduled_at'`);
    if (schedColumns.length === 0) {
      await connection.query(`ALTER TABLE campaigns ADD COLUMN scheduled_at DATETIME NULL`);
      console.log("Added scheduled_at column to campaigns table.");
    }

    // Check for mappings column
    const [mapColumns] = await connection.query(`SHOW COLUMNS FROM campaigns LIKE 'mappings'`);
    if (mapColumns.length === 0) {
      await connection.query(`ALTER TABLE campaigns ADD COLUMN mappings JSON`);
      console.log("Added mappings column to campaigns table.");
    }

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
// Failed number table
    const createFailedNumbersTable = `
      CREATE TABLE IF NOT EXISTS failed_numbers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createFailedNumbersTable);
    console.log("Failed Numbers table ready.");
    // Check for rejection_reason column
    const [columns] = await connection.query(`SHOW COLUMNS FROM templates LIKE 'rejection_reason'`);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE templates ADD COLUMN rejection_reason TEXT`);
      console.log("Added rejection_reason column to templates table.");
    }

    // Check for quality_score column
    const [qualityColumns] = await connection.query(`SHOW COLUMNS FROM templates LIKE 'quality_score'`);
    if (qualityColumns.length === 0) {
      await connection.query(`ALTER TABLE templates ADD COLUMN quality_score JSON`);
      console.log("Added quality_score column to templates table.");
    }

    // Check for stats column
    const [statsColumns] = await connection.query(`SHOW COLUMNS FROM templates LIKE 'stats'`);
    if (statsColumns.length === 0) {
      await connection.query(`ALTER TABLE templates ADD COLUMN stats JSON`);
      console.log("Added stats column to templates table.");
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

    const createWhatsappMessagesTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wamid VARCHAR(100) NOT NULL UNIQUE,
        template_id INT,
        template_name VARCHAR(255),
        category VARCHAR(50),
        recipient VARCHAR(50),
        status VARCHAR(20) DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP NULL,
        read_at TIMESTAMP NULL,
        failed_at TIMESTAMP NULL,
        INDEX (template_id),
        INDEX (sent_at)
      )
    `;
    await connection.query(createWhatsappMessagesTable);
    console.log("Whatsapp Messages table ready.");

    // Check for campaign_id column in whatsapp_messages
    const [wmColumns] = await connection.query(`SHOW COLUMNS FROM whatsapp_messages LIKE 'campaign_id'`);
    if (wmColumns.length === 0) {
      await connection.query(`ALTER TABLE whatsapp_messages ADD COLUMN campaign_id INT`);
      await connection.query(`ALTER TABLE whatsapp_messages ADD FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL`);
      console.log("Added campaign_id column to whatsapp_messages table.");
    }

  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await connection.end();
  }
}

initDb();
