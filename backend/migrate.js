const db = require('./config/db');

async function migrate() {
  try {
    console.log('Migrating database...');
    await db.query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE');
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
