const { pool } = require('./db/init');
async function run() {
  try {
    let res = await pool.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'pages_content'::regclass;
    `);
    console.log('Constraints:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
