const express = require('express');
const router = express.Router();

const CHECK_HEALTH = '✅ Health OK';

router.get('/', async (req, res) => {
    res.send({
        health: CHECK_HEALTH,
    });
});

module.exports = router;
