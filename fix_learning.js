const { pool } = require('./db/init');
async function run() {
  try {
    await pool.query('INSERT INTO pages_content (page_slug, title, content_text, image_url) VALUES ($1, $2, $3, $4)', ['learning-by-doing', 'Biology Lab', '', 'https://www.mvmmangadu.in/wp-content/uploads/2019/12/Biology-Lab.jpg']);
    await pool.query('INSERT INTO pages_content (page_slug, title, content_text, image_url) VALUES ($1, $2, $3, $4)', ['learning-by-doing', 'Chemistry Lab', '', 'https://www.mvmmangadu.in/wp-content/uploads/2019/12/Chemistry-Lab.jpg']);
    await pool.query('INSERT INTO pages_content (page_slug, title, content_text, image_url) VALUES ($1, $2, $3, $4)', ['learning-by-doing', 'Physics Lab', '', 'https://www.mvmmangadu.in/wp-content/uploads/2019/12/Physics-Lab.jpeg']);
    
    const res = await pool.query('SELECT * FROM pages_content WHERE page_slug=$1', ['learning-by-doing']);
    console.log('Inserted:', res.rows.length, 'items');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
