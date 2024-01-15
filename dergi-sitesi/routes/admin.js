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

router.post('/dergiolustur', upload.fields([
    { name: 'pdfDosya', maxCount: 1 },
    { name: 'resim', maxCount: 1 }
]), async (req, res) => {
    // Your existing code

    const { baslik, yazar, konu, aciklama, kategorisi, resim, indirmeLinki } = req.body;
    const userS = req.session.user;
    const olusturan_user_id = userS.userid;

    const insertQuery = `
        INSERT INTO dergiler (konu, aciklama, resim, indirme_linki, olusturan_user_id, dergi_basligi, pdf_dosya, yazar, kategorisi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    if (!req.files || !req.files['pdfDosya'] || !req.files['resim']) {
        console.error('Dosya yüklemesi başarısız oldu.');
        return res.status(400).send('Bad Request');
    }

    const pdfDosya = req.files['pdfDosya'][0];
    const resimDosya = req.files['resim'][0];

    try {
        const result = await db.query(insertQuery, [konu, aciklama, resimDosya.filename, indirmeLinki, olusturan_user_id, baslik, pdfDosya.filename, yazar, kategorisi]);
        console.log('Dergi başarıyla oluşturuldu.');
        res.redirect('/admin/panel');
    } catch (error) {
        console.log(error);
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
    const userS = req.session.user;
    if (userS && userS.role==='admin') {
        const dergiId = req.params.dergiId;
        const { konu, aciklama, resim, baslik, kategorisi } = req.body;
    
        const updateQuery = `
            UPDATE dergiler
            SET dergi_basligi = ?, konu = ?, aciklama = ?, resim = ?, kategorisi= ?
            WHERE dergi_id = ?
        `;
        try {
            await db.query(updateQuery, [baslik, konu, aciklama, resim, kategorisi, dergiId]);
            console.log('Dergi başarıyla güncellendi.');
            res.redirect('/admin/dergiyonetim');
        } catch (error) {
            console.error('Dergi güncellenirken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/')
    }




});


router.post('/:dergiId/sil', (req, res) => {
    const userS = req.session.user;
if (userS && userS.role==='admin') {
    const dergiId = req.params.dergiId;
    db.query('DELETE FROM yorumlar WHERE dergi_id = ?', [dergiId]);
    db.query('DELETE FROM dergiler WHERE dergi_id = ?', [dergiId], (error, results) => {
        if (error) {
            console.error('Dergi silinirken bir hata oluştu: ' + error);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Dergi başarıyla silindi.');
        res.redirect('/admin/dergiyonetim');
    });

} else {
    res.redirect('/')
}

});




router.get('/kullaniciyonetim', async(req,res)=>{
    const userS = req.session.user;
    if (userS && userS.role==='admin') {

        try {
            const [results, fields] = await db.query('SELECT * FROM users');

            console.log(results);
            const users = results;
            res.render('admin/kullaniciYonetim', {userS,users})
        } catch (error) {
            console.log('Veri tabanından kullanıcıları çekerken hata oluştu: ' + error.message);
            res.status(500).json({ error: 'Veri tabanından kullanıcıları çekerken hata oluştu' });
        }


    } else {
        res.render('404', {userS});
    }

});


router.get('/kullanici/:userId', async(req,res)=>{
    const userId = req.params.userId
    const userS=req.session.user;

    if (userS && userS.role==='admin') {
        try {
            const query = 'SELECT * FROM users WHERE user_id = ?';
            const result= await db.query(query,[userId]);
            if (result.length > 0) {
                const [userl] = result[0];
                console.log(userl);
                res.render('admin/kullaniciDetay', { userS,userl});
              } else {
                res.status(404).json({ error: 'Kullanıcı bulunamadı' });
              }
        } catch (error) {
            console.log('Kullanıcı detayları alınırken hata oluştu: ' + error.message);
        }
    } else {
        res.render('404', {userS});
    }
});


router.post('/kullanici/:userId/update', async(req,res)=>{
    const userId = req.params.userId;
    const userS= req.session.user;
    const { newUsername, newEmail, newFirstName, newLastName, newRole } = req.body;
    if (userS&& userS.role==='admin') {
        const updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?
        WHERE user_id = ?
      `;
      try {
        await db.query(updateQuery, [newUsername, newEmail, newFirstName, newLastName, newRole, userId])
        res.redirect('/admin/kullanici/' + userId);
      } catch (error) {
        console.error('Kullanıcı güncellenirken hata oluştu: ' + err.message);
        res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
      }
    } else {
        res.render('404', {userS});
    }


}),
module.exports=router;
