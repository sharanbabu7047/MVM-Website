const { pool } = require('./db/init');
const bcrypt = require('bcrypt');

const createAdmin = async () => {
  const username = 'admin';
  const password = 'password123'; // The default password for the admin

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO admins (username, password_hash) 
      VALUES ($1, $2) 
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [username, passwordHash]);
    
    if (res.rows.length > 0) {
      console.log('✅ Admin user created successfully.');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      console.log('Please change this password later or delete this script.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    pool.end();
  }
};

createAdmin();
