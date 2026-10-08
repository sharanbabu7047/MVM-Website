const { pool } = require('./db/init');

const syllabusData = [
  ['English', 'English'],
  ['English Grammar', 'Mathematics'],
  ['Mathematics', 'Mathematics-Lab Activity'],
  ['Computer Science', 'Science'],
  ['Phe', 'Computer Science'],
  ['Art Education', 'Art And Craft'],
  ['Craft', 'Music'],
  ['Music', 'Life Skills'],
  ['English Lab', 'Health and Physical Education'],
  ['Tamil II And III Lang', 'Tamil II And III Lang'],
  ['Hindi II and III Lang', 'Hindi II and III Lang'],
  ['&ndash;', 'Social Science']
];

async function run() {
  try {
    // Clear existing rows first to prevent duplicates
    await pool.query("DELETE FROM pages_content WHERE page_slug = 'syllabus'");
    console.log('Cleared old syllabus rows.');

    for (const [primary, middle] of syllabusData) {
      await pool.query(
        'INSERT INTO pages_content (page_slug, title, content_text) VALUES ($1, $2, $3)',
        ['syllabus', primary, middle]
      );
    }
    const res = await pool.query("SELECT * FROM pages_content WHERE page_slug='syllabus'");
    console.log(`Done. ${res.rows.length} syllabus items in DB.`);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();

