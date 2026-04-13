const express = require('express');
const itemRoutes = require('./item.routes');
const checkHealthRoutes = require('./health.routes');

const router = express.Router();

router.use('/items', itemRoutes);
router.use('/check-health', checkHealthRoutes);

module.exports = router;
