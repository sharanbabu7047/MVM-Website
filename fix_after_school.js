const { pool } = require('./db/init');
async function run() {
  try {
    await pool.query('INSERT INTO pages_content (page_slug, title, content_text, image_url) VALUES ($1, $2, $3, $4)', ['after-school', 'Football', '', 'https://www.mvmmangadu.in/wp-content/uploads/2020/01/Foot-Ball.jpg']);
    const res = await pool.query('SELECT * FROM pages_content WHERE page_slug=$1', ['after-school']);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
