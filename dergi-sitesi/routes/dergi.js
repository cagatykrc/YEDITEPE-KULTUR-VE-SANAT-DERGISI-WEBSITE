const express = require('express');
const router = express.Router();
const db = require('../utility/database');

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
        const ekleyenkisi = dergi.olusturan_user_id === 1 ? 'Admin' : 'Anonim';
        res.render('dergiDetay', { dergi, ekleyenkisi });
    });
});

module.exports = router;
// Dergi Oluşturma Formu Gönderildiğinde
router.post('/olustur', (req, res) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
        const { konu, aciklama, resim, indirmeLinki } = req.body;
        const olusturanUserId = req.user.user_id;

        const insertQuery = `
            INSERT INTO dergiler (konu, aciklama, resim, indirme_linki, olusturan_user_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [konu, aciklama, resim, indirmeLinki, olusturanUserId], (err, result) => {
            if (err) {
                console.error(err);
                // Hata durumunda bir sayfaya yönlendirme yapabilir veya hatayı kullanıcıya gösterebilirsiniz.
                res.status(500).send('Internal Server Error');
            } else {
                console.log('Dergi başarıyla oluşturuldu.');
                console.log(result); // Oluşturulan dergi bilgilerini konsola yazdır
                // Başarı durumunda bir sayfaya yönlendirme yapabilirsiniz.
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});
module.exports = router;