const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const auth = require('../middleware/auth');

router.get('/', auth, telemetryController.getTelemetry);

module.exports = router;
