const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for some managed databases like Neon, Supabase
  },
});

const initDB = async () => {
  try {
    const client = await pool.connect();
    
    // Create admission_enquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admission_enquiries (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        grade VARCHAR(50) NOT NULL,
        parent_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create contact_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully.');
    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  pool,
  initDB,
};
