const { pool } = require('./db/init');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    // Update existing admin or insert new if it doesn't exist
    const res = await pool.query("UPDATE admins SET username=$1, password_hash=$2 WHERE username='admin'", ['admin@mvmredhills.com', passwordHash]);
    
    if (res.rowCount === 0) {
      console.log('No admin found with username "admin". Trying to insert new.');
      await pool.query("INSERT INTO admins (username, password_hash) VALUES ($1, $2)", ['admin@mvmredhills.com', passwordHash]);
      console.log('Inserted admin@mvmredhills.com');
    } else {
      console.log('Updated existing admin to admin@mvmredhills.com');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
