const express = require('express');
const router = express.Router();
const db = require('../utility/database');

// Dergi Detayı
router.get('/:dergiId', (req, res) => {
    const dergiId = req.params.dergiId;
    
    // Dergiyi veritabanından çek
    db.query('SELECT * FROM dergiler WHERE dergi_id = ?', [dergiId], (error, results) => {
        if (error) {
            console.error('Dergi verilerini çekerken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }
        
        if (results.length === 0) {
            // Dergi bulunamadıysa 404 hatası gönder
            return res.status(404).send('Dergi bulunamadı');
        }
        
        const dergi = results[0];
        console.log(dergi, dergiId);
        const ekleyenkisi = dergi.olusturan_user_id === 1 ? 'Admin' : 'Anonim';
        const userS = req.session.user;
        res.render('dergiDetay', { dergi, ekleyenkisi, userS });
    });
});

// Dergi Oluşturma Formu Gönderildiğinde

module.exports = router;