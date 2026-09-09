const { pool } = require('./db/init');
async function migrate() {
    try {
        await pool.query('ALTER TABLE pages_content DROP CONSTRAINT IF EXISTS pages_content_page_slug_key');
        console.log("pages_content_page_slug_key constraint dropped successfully.");
    } catch(err) {
        console.error("Migration error:", err);
    } finally {
        pool.end();
    }
}
migrate();
