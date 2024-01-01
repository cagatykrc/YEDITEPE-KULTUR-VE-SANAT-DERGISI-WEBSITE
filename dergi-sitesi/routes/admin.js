const express = require('express');
const router = express.Router();
const db = require('../utility/database');
router.get('/panel', (req, res) => {
    const userS = req.session.user;

    // Kullanıcı admin rolüne sahipse, sayfayı render et
    if (userS && userS.role === 'admin') {
        res.render('kontrolPanel',{userS});
    } else {
        // Admin değilse, başka bir sayfaya yönlendir veya hata mesajı göster
        res.status(403).send('Bu sayfaya erişim izniniz yok.');
    }
});



router.get('/dergiolustur', (req,res)=>{
    const userS = req.session.user;
    if (userS && userS.role === 'admin') {
        res.render('dergiOlustur',{userS} )
        
    }
    else{
        res.redirect('/')
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

module.exports=router;
