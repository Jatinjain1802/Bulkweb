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
