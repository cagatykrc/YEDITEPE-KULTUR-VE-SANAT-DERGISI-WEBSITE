const express = require('express');
const router = express.Router();
const db = require('../utility/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get('/panel', (req, res) => {
    const userS = req.session.user;

    // Kullanıcı admin rolüne sahipse, sayfayı render et
    if (userS && userS.role === 'admin') {
        res.render('admin/kontrolPanel', { userS });
    } else {
        // Admin değilse, başka bir sayfaya yönlendir veya hata mesajı göster
        res.render('404', { userS });
    }
});
const uploadFolder = path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder); // Dosyaların yükleneceği klasör
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Dosya adını belirleme
    }
});

const upload = multer({ storage: storage });

router.get('/dergiyonetim', async (req, res) => {
    const userS = req.session.user;
    if (userS && userS.role === 'admin') {
        try {
            const [results, fields] = await db.query('SELECT * FROM dergiler');
            const dergiler = results;
            res.render('admin/dergiYonetim', { dergiler, userS });
        } catch (error) {
            console.error('Dergi verilerini çekerken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('404', { userS });
    }
});



router.get('/dergiolustur',  (req, res) => {
    const userS = req.session.user;
    if (userS && userS.role === 'admin') {
        res.render('admin/dergiOlustur', { userS });
    } else {
        res.render('404', { userS });
    }
});

router.post('/dergiolustur', upload.single('pdfDosya'), async(req, res) => {
        const { baslik,yazar, konu, aciklama, resim, indirmeLinki } = req.body;
        const userS = req.session.user
        const insertQuery = `
            INSERT INTO dergiler (konu, aciklama, resim, indirme_linki, olusturan_user_id,dergi_basligi, pdf_dosya, yazar )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        if (!req.file) {
            console.error('Dosya yüklemesi başarısız oldu.' ,req.fileValidationError);
            return res.status(400).send('Bad Request');
        }
        const pdfDosya = req.file;
            try {
                const result = await db.query(insertQuery, [konu, aciklama, resim, indirmeLinki, 1,baslik, pdfDosya.filename, yazar]);
                console.log('Dergi başarıyla oluşturuldu.'); // Oluşturulan dergi bilgilerini konsola yazdır
                res.redirect('/admin/panel');
            } catch (error) {
                console.log(error);
                // Hata durumunda bir sayfaya yönlendirme yapabilir veya hatayı kullanıcıya gösterebilirsiniz.
                res.status(500).send('Internal Server Error');
            }
});

router.get('/:dergiId/duzenle', async (req, res) => {
    const dergiId = req.params.dergiId;
    const userS = req.session.user;

    if (userS && userS.role === 'admin') {
        try {
            const [results] = await db.query('SELECT * FROM dergiler WHERE dergi_id = ?', [dergiId]);

            if (results.length === 0) {
                return res.status(404).send('Dergi bulunamadı');
            }

            const dergi = results[0];
            console.log(dergi);
            res.render('admin/dergiDuzenle', { dergi, userS });

        } catch (error) {
            console.error('Dergi bilgisi alınırken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('404', { userS });
    }
});


router.post('/:dergiId/duzenle',async (req, res) => {
    const dergiId = req.params.dergiId;
    const { konu, aciklama, resim, baslik } = req.body;

    const updateQuery = `
        UPDATE dergiler
        SET dergi_basligi = ?, konu = ?, aciklama = ?, resim = ?
        WHERE dergi_id = ?
    `;
    try {
        await db.query(updateQuery, [baslik, konu, aciklama, resim, dergiId]);
        console.log('Dergi başarıyla güncellendi.');
        res.redirect('/admin/dergiyonetim');
    } catch (error) {
        console.error('Dergi güncellenirken bir hata oluştu: ' + error);
        return res.status(500).send('Internal Server Error');
    }



    });


router.post('/:dergiId/sil', (req, res) => {
    const dergiId = req.params.dergiId;
    db.query('DELETE FROM dergiler WHERE dergi_id = ?', [dergiId], (error, results) => {
        if (error) {
            console.error('Dergi silinirken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Dergi başarıyla silindi.');
        res.redirect('/admin/dergiyonetim');
    });
});

module.exports=router;
