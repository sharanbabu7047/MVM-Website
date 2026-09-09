const { pool } = require('./db/init');
const bcrypt = require('bcrypt');

async function check() {
  try {
    let res = await pool.query('SELECT * FROM admins');
    console.log('Admins in DB:', res.rows);

    if (res.rows.length === 0) {
      console.log('No admin found, inserting now...');
      const passwordHash = await bcrypt.hash('password123', 10);
      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['admin', passwordHash]);
      res = await pool.query('SELECT * FROM admins');
      console.log('Admins after insert:', res.rows);
    } else {
      console.log('Admin already exists. Updating password to password123 just in case.');
      const passwordHash = await bcrypt.hash('password123', 10);
      await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [passwordHash, 'admin']);
      console.log('Password updated successfully.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
