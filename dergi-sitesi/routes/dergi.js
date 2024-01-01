const express = require('express');
const router = express.Router();
const db = require('../utility/database');

// Dergi Detayı

router.get('/:dergiId', async (req, res) => {
    const dergiId = req.params.dergiId;
    const userS = req.session.user;

    try {
        // Dergi bilgilerini çek
        const [dergiResults] = await db.query('SELECT * FROM dergiler WHERE dergi_id = ?', [dergiId]);
        const dergi = dergiResults[0];

        // Dergi yorumlarını çek
        const yorumSorgu = 'SELECT y.*, u.username FROM yorumlar y JOIN users u ON y.kullanici_id = u.user_id WHERE y.dergi_id = ?';
        const [yorumResults] = await db.query(yorumSorgu, [dergiId]);
        const dergiYorumlari = yorumResults;

        // Dergi sayfasını render et
        res.render('dergiDetay', { dergi, userS, dergiYorumlari });
    } catch (error) {
        // Hata durumunda
        console.error('Dergi ve yorum verilerini çekerken bir hata oluştu: ' + error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

// Örnek endpoint
router.post('/:dergiId/yorumEkle', async (req, res) => {
    const dergiId = req.params.dergiId;
    const kullaniciId = req.session.user.user_id; // Varsayılan olarak giriş yapan kullanıcı alınıyor
    const yorumMetni = req.body.yorumMetni;

    // Yorumu veritabanına eklemek için gerekli sorguyu yapın
    const insertQuery = `
        INSERT INTO yorumlar (dergi_id, kullanici_id, yorum_metni)
        VALUES (?, ?, ?)
    `;

    try {
        await db.promise().query(insertQuery, [dergiId, kullaniciId, yorumMetni]);
        res.redirect(`/dergiler/${dergiId}`);
    } catch (error) {
        console.error('Yorum eklenirken bir hata oluştu: ' + error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;