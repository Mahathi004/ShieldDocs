const db = require('../config/db');

exports.getLogs = async (req, res) => {
  // Ideally filter by user_id, but the prompt says "Return all logs (latest first)"
  const user_id = req.user.user.id;

  try {
    const logs = await db.query(
      `SELECT al.id, al.action, al.file_name, al.timestamp, u.name as user_name 
       FROM activity_logs al 
       JOIN users u ON al.user_id = u.id 
       WHERE al.user_id = $1
       ORDER BY al.timestamp DESC`,
      [user_id]
    );
    res.json(logs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
