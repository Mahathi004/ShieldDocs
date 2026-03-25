const db = require('../config/db');

exports.getTelemetry = async (req, res) => {
  const user_id = req.user.user.id;

  try {
    // total_documents (Saved)
    const totalDocsResult = await db.query(
      'SELECT COUNT(*) FROM documents WHERE user_id = $1 AND is_deleted = false AND is_saved = true',
      [user_id]
    );
    const total_documents = parseInt(totalDocsResult.rows[0].count, 10);

    // deleted_documents
    const deletedDocsResult = await db.query(
      'SELECT COUNT(*) FROM documents WHERE user_id = $1 AND is_deleted = true',
      [user_id]
    );
    const deleted_documents = parseInt(deletedDocsResult.rows[0].count, 10);

    // recent_logs (limit 5)
    const recentLogsResult = await db.query(
      'SELECT file_name, action, timestamp FROM activity_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5',
      [user_id]
    );
    const recent_logs = recentLogsResult.rows;

    // last_activity
    const last_activity = recent_logs.length > 0 ? recent_logs[0].timestamp : null;

    res.json({
      total_documents,
      deleted_documents,
      last_activity,
      recent_logs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
