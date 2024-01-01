const express = require('express');
const router = express.Router();
const db = require('../utility/database');

// Dergi Detayı
router.get('/:dergiId', async (req, res) => {
    const dergiId = req.params.dergiId;
    console.log('İşlem başladı');
    const [results] = await db.query('SELECT * FROM dergiler WHERE dergi_id = ?', [dergiId]);
    const dergi = results[0];
    console.log(dergi, dergiId);
    const userS = req.session.user;
    res.render('dergiDetay', { dergi, userS });
});

// Dergi Oluşturma Formu Gönderildiğinde

module.exports = router;