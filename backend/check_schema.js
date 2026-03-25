const db = require('./config/db');

async function checkSchema() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'documents'");
    console.log('Columns in documents table:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

checkSchema();
