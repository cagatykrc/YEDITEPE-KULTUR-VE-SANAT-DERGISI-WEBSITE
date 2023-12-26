// routes/index.js
const express = require('express');
const router = express.Router();
const db = require('../utility/database.js');

// Ana sayfa
router.get('/', (req, res) => {
    // MySQL sorgusu ile dergi verilerini çek
    db.query('SELECT * FROM dergiler', (error, results) => {
        if (error) {
            console.error('Dergi verilerini çekerken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }

        const dergiler = results;
        res.render('index', { dergiler });
    });
});

module.exports = router;