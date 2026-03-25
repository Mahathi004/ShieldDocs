const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // 1. Add new columns
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)');
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)');
        
        // 2. Migrate data
        const users = await db.query('SELECT id, name FROM users');
        for (const user of users.rows) {
            const parts = user.name.split(' ');
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';
            
            await db.query(
                'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
                [firstName, lastName, user.id]
            );
        }
        
        // 3. Make columns NOT NULL (optional, but good for integrity)
        // Only if we are sure all have names. For now let's keep it flexible.
        
        // 4. Remove old column
        await db.query('ALTER TABLE users DROP COLUMN name');
        
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
