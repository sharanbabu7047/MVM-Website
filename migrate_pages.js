const { pool } = require('./db/init');
async function migrate() {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS pages_content (
            id SERIAL PRIMARY KEY,
            page_slug VARCHAR(255) UNIQUE NOT NULL,
            title VARCHAR(255),
            content_text TEXT,
            image_url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log("pages_content table created successfully.");
    } catch(err) {
        console.error("Migration error:", err);
    } finally {
        pool.end();
    }
}
migrate();
