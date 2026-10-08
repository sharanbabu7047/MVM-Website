const { pool } = require('./db/init');
async function run() {
  try {
    let res = await pool.query("SELECT * FROM pages_content WHERE page_slug='syllabus'");
    console.log('Syllabus items:', res.rows.length);
    res = await pool.query("SELECT * FROM pages_content WHERE page_slug='after-school'");
    console.log('After-school items:', res.rows.length);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
