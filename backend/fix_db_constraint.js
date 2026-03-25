const db = require('./config/db');

async function fixConstraint() {
    try {
        console.log('Checking for constraint...');
        await db.query(`ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_action_check`);
        console.log('Old constraint dropped.');
        
        await db.query(`ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_action_check CHECK (action IN ('login', 'upload', 'save', 'redact', 'delete', 'restore', 'download'))`);
        console.log('New constraint added with: login, upload, save, redact, delete, restore, download');
        
        process.exit(0);
    } catch (err) {
        console.error('Error updating constraint:', err);
        process.exit(1);
    }
}

fixConstraint();
