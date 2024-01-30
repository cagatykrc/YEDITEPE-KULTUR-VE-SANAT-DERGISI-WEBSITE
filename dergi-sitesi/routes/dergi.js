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
        const yorumSorgu = 'SELECT y.*, u.first_name FROM yorumlar y JOIN users u ON y.kullanici_id = u.user_id WHERE y.dergi_id = ?';
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

router.post('/:dergiId/yorumsil', async (req, res) => {
    const userS = req.session.user;
    const yorumId = req.body.yorumId;
    const dergiId = req.params.dergiId;

    if (userS && userS.role === 'admin') {
        try {
            const query = 'DELETE FROM yorumlar WHERE yorum_id = ?';
            await db.query(query, [yorumId]);
            console.log( yorumId + 'Yorum silindi.');
            res.json({ message:  yorumId +' Yorum başarıyla silindi' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Yorum silinirken bir hata oluştu' });
        }
    } else {
        res.status(403).json({ error: 'Yetkisiz erişim' });
    }
});

// Örnek endpoint
router.post('/:dergiId/yorumEkle', async (req, res) => {
    const dergiId = req.params.dergiId;

    // Kullanıcının oturum açmış olup olmadığını kontrol et
    if (!req.session.user) {
        res.redirect('/auth/giris');
        return;    
    }

    const kullaniciId = req.session.user;
    const yorumMetni = req.body.yorumMetni;
    console.log(kullaniciId);
    // Yorumu veritabanına eklemek için gerekli sorguyu yapın
    const insertQuery = `
        INSERT INTO yorumlar (dergi_id, kullanici_id, yorum_metni)
        VALUES (?, ?, ?)
    `;

    try {
        await db.query(insertQuery, [dergiId, kullaniciId.id, yorumMetni]);
        res.redirect(`/dergiler/${dergiId}`);
    } catch (error) {
        console.error('Yorum eklenirken bir hata oluştu: ' + error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/:dergiId/indir',(req, res) => {
    try {
        const dergiId = req.params.dergiId;
        const pdfDosya = req.body.pdf_dosya;
        console.log(pdfDosya);
        res.download("./public/uploads/"+pdfDosya);
        
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;