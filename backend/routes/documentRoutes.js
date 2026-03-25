const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// 1. Save Text
router.post('/save-text', auth, documentController.saveText);

// 2. Upload File
router.post('/upload-file', auth, upload.single('document'), documentController.uploadFile);

// 3. Get Documents
router.get('/', auth, documentController.getDocuments);

// 4. Get Bin Documents
router.get('/bin', auth, documentController.getBinDocuments);

// Bin System
// DELETE
router.delete('/:id', auth, documentController.deleteDocument);

// RESTORE
router.post('/restore/:id', auth, documentController.restoreDocument);

// PERMANENT DELETE
router.delete('/permanent/:id', auth, documentController.permanentDeleteDocument);

// Save Redacted
router.post('/save-redacted', auth, documentController.saveRedactedDocument);

// Get Saved
router.get('/saved', auth, documentController.getSavedDocuments);

router.post('/apply-redactions', auth, documentController.applyRedactions);

module.exports = router;
