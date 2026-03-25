const db = require('../config/db');
const xss = require('xss');
const fileType = require('file-type');
const fs = require('fs');

// Save Text
exports.saveText = async (req, res) => {
  const { file_name, redacted_text } = req.body;
  const user_id = req.user.user.id;

  const sanitized_text = xss(redacted_text); // XSS prevention
  const safe_file_name = xss(file_name);

  try {
    const newDoc = await db.query(
      'INSERT INTO documents (user_id, file_name, file_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, safe_file_name, 'text', sanitized_text]
    );

    // Log action "save"
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, safe_file_name || 'Untitled Text', 'save']
    );

    res.status(201).json(newDoc.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Upload File
exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const user_id = req.user.user.id;
  const file_name = xss(req.file.originalname); // Sanitize file name
  // Convert mimetype to 'pdf' or 'text' to satisfy DB CHECK constraint IN ('text', 'pdf')
  const file_type = req.file.mimetype === 'application/pdf' ? 'pdf' : 'text';
  const file_path = req.file.path; // Make sure we only store this if requested.

  // Magic Number buffer check against spoofing
  try {
    const buffer = fs.readFileSync(file_path);
    const typeInfo = await fileType.fromBuffer(buffer);
    
    // Restrict PDFs
    if (file_type === 'pdf') {
      if (!typeInfo || typeInfo.mime !== 'application/pdf') {
        fs.unlinkSync(file_path); // Destroy unsafe file
        return res.status(400).json({ error: 'MIME Spoofing detected! Not a genuine PDF.' });
      }
    } else {
      // Restrict text: file-type usually returns undefined/null for pure text since it has no magic bytes.
      // If it returns something, it might be an exe or archive disguised as txt.
      if (typeInfo && typeInfo.mime !== 'text/plain') {
        fs.unlinkSync(file_path);
        return res.status(400).json({ error: 'MIME Spoofing detected! Dangerous file masked as text.' });
      }
    }
  } catch (err) {
    if (fs.existsSync(file_path)) fs.unlinkSync(file_path);
    return res.status(500).json({ error: 'Failed to perform deep file security scan.' });
  }

  try {
    const newDoc = await db.query(
      'INSERT INTO documents (user_id, file_name, file_type, file_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, file_name, file_type, file_path]
    );

    // Log action "upload"
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, file_name, 'upload']
    );

    res.status(201).json(newDoc.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Documents
exports.getDocuments = async (req, res) => {
  const user_id = req.user.user.id;
  
  try {
    const docs = await db.query(
      'SELECT id, file_name, file_type, content, file_path, is_saved, created_at FROM documents WHERE user_id = $1 AND is_deleted = false ORDER BY created_at DESC',
      [user_id]
    );
    res.json(docs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get ONLY Saved Documents
exports.getSavedDocuments = async (req, res) => {
  const user_id = req.user.user.id;
  
  try {
    const docs = await db.query(
      'SELECT id, file_name, file_type, content, file_path, is_saved, created_at FROM documents WHERE user_id = $1 AND is_deleted = false AND is_saved = true ORDER BY created_at DESC',
      [user_id]
    );
    res.json(docs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// DELETE Document
exports.deleteDocument = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user.id;

  try {
    const docQuery = await db.query('SELECT file_name FROM documents WHERE id = $1 AND user_id = $2', [id, user_id]);
    
    if (docQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }
    
    const file_name = docQuery.rows[0].file_name;

    await db.query(
      'UPDATE documents SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    // Log action "delete"
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, file_name, 'delete']
    );

    res.json({ message: 'Document moved to bin successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// RESTORE Document
exports.restoreDocument = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user.id;

  try {
    const docQuery = await db.query('SELECT file_name FROM documents WHERE id = $1 AND user_id = $2', [id, user_id]);
    
    if (docQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }

    const file_name = docQuery.rows[0].file_name;

    await db.query(
      'UPDATE documents SET is_deleted = false, deleted_at = NULL WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    // Log action "restore"
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, file_name, 'restore']
    );

    res.json({ message: 'Document restored successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Apply Redactions (Calls FastAPI Backend)
exports.applyRedactions = async (req, res) => {
  const { file_path, redactions, rotation } = req.body;
  const user_id = req.user.user.id;

  if (!file_path) {
    return res.status(400).json({ error: 'Missing file_path' });
  }

  // Normalize path for cross-platform (forward slashes)
  const normalizedPath = file_path.replace(/\\/g, '/');

  try {
    console.log(`[Backend] Attempting redaction on: ${normalizedPath} via FastAPI (port 8000)`);
    
    // Call FastAPI backend for actual PDF processing
    const response = await fetch('http://127.0.0.1:8000/apply-redactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_path: normalizedPath,
        redactions,
        rotation: rotation || 0
      })
    });

    if (!response.ok) {
      let errorDetail = 'FastAPI redaction failed';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) {
        errorDetail = `FastAPI returned status ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    console.log('[Backend] Redaction success:', data.redacted_file);

    // Log action "redact"
    const path = require('path');
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, path.basename(file_path), 'redact']
    );

    res.json(data);
  } catch (err) {
    console.error('[Backend] Redaction error:', err.message);
    
    let userMessage = 'Redaction failed. Please ensure the AI backend (port 8000) is running.';
    if (err.code === 'ECONNREFUSED') {
       userMessage = 'Connection refused: AI backend (port 8000) is not running.';
    } else if (err.message.includes('fetch failed')) {
       userMessage = 'Network error: Could not reach AI backend on port 8000.';
    }

    res.status(500).json({ 
      error: userMessage,
      detail: err.message
    });
  }
};

// PERMANENT DELETE Document
exports.permanentDeleteDocument = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user.id;

  try {
    const docQuery = await db.query('SELECT file_path, file_name FROM documents WHERE id = $1 AND user_id = $2', [id, user_id]);
    
    if (docQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }

    const doc = docQuery.rows[0];

    // Delete file from filesystem if file_path exists
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      try {
        fs.unlinkSync(doc.file_path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete from database
    await db.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [id, user_id]);

    // Log action "permanent_delete"
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, doc.file_name, 'permanent_delete']
    );

    res.json({ message: 'Document permanently deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getBinDocuments = async (req, res) => {
  const user_id = req.user.user.id;
  try {
    const result = await db.query(
      'SELECT id, file_name, file_type, file_path, deleted_at FROM documents WHERE user_id = $1 AND is_deleted = true ORDER BY deleted_at DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get bin documents error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Save Redacted Document to Workspace
exports.saveRedactedDocument = async (req, res) => {
  const { file_path, original_name } = req.body;
  const user_id = req.user.user.id;

  if (!file_path) {
    return res.status(400).json({ error: 'Missing file_path' });
  }

  const file_name = original_name ? `Redacted_${original_name}` : 'Redacted_Document.pdf';

  try {
    const newDoc = await db.query(
      'INSERT INTO documents (user_id, file_name, file_type, file_path, is_saved) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, file_name, 'pdf', file_path, true]
    );

    // Log action "save"
    await db.query(
      'INSERT INTO activity_logs (user_id, file_name, action) VALUES ($1, $2, $3)',
      [user_id, file_name, 'save']
    );

    res.status(201).json(newDoc.rows[0]);
  } catch (err) {
    console.error('Save redacted document error:', err.message);
    res.status(500).json({ error: 'Server error saving document' });
  }
};
