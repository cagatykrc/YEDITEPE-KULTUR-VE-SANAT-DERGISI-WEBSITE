const express = require('express');
const router = express.Router();
const db = require('../utility/database');
router.get('/panel', (req, res) => {
    const userS = req.session.user;

    // Kullanıcı admin rolüne sahipse, sayfayı render et
    if (userS && userS.role === 'admin') {
        res.render('admin/kontrolPanel', { userS });
    } else {
        // Admin değilse, başka bir sayfaya yönlendir veya hata mesajı göster
        res.status(403).send('Bu sayfaya erişim izniniz yok.');
    }
});

router.get('/dergiyonetim', (req,res)=>{
    const userS= req.session.user;
    if (userS && userS==='admin') {
        res.render('admin/dergiyonetim', { userS });
    } else {
        res.status(403).send('Bu sayfaya erişim izniniz yok.');
    }
});

router.get('/dergiolustur', (req, res) => {
    const userS = req.session.user;
    if (userS && userS.role === 'admin') {
        res.render('admin/dergiOlustur', { userS });
    } else {
        res.redirect('/');
    }
});

router.post('/dergiolustur', (req, res) => {
    if (req.user && (req.user.role === 'admin')) {
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
                res.redirect('/admin/panel');
            }
        });
    } else {
        res.redirect('/');
    }
});

router.get('/:dergiId/duzenle', (req, res) => {
    const dergiId = req.params.dergiId;
    db.query('SELECT * FROM dergiler WHERE dergi_id = ?', [dergiId], (error, results) => {
        if (error) {
            console.error('Dergi bilgisi alınırken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(404).send('Dergi bulunamadı');
        }

        res.render('dergiDuzenle', { dergi: results[0] });
    });
});


router.post('/:dergiId/duzenle', (req, res) => {
    const dergiId = req.params.dergiId;
    const { konu, aciklama, resim } = req.body;

    const updateQuery = `
        UPDATE dergiler
        SET konu = ?, aciklama = ?, resim = ?
        WHERE dergi_id = ?
    `;

    db.query(updateQuery, [konu, aciklama, resim, dergiId], (error, results) => {
        if (error) {
            console.error('Dergi güncellenirken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Dergi başarıyla güncellendi.');
        res.redirect('/dergiler/' + dergiId);
    });
});

router.get('/:dergiId/sil', (req, res) => {
    const dergiId = req.params.dergiId;
    db.query('DELETE FROM dergiler WHERE dergi_id = ?', [dergiId], (error, results) => {
        if (error) {
            console.error('Dergi silinirken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Dergi başarıyla silindi.');
        res.redirect('/dergiler');
    });
});

module.exports=router;
