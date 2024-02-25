const express = require('express');
const router = express.Router();
const Dergiler = require('../models/Dergiler');
const Yorumlar = require('../models/Yorumlar');
const Users = require('../models/Users');
const verifyToken= require('../utility/verifyToken');
const postlimiter= require('../utility/limiter');
const logger = require('../utility/logger');
const options = { timeZone: 'Europe/Istanbul' }; // Türkiye saat dilimi
const formattedDate = new Date();
const now = formattedDate.toLocaleString('tr-TR', options);


// const limiterTwoRequests = createLimiter(2);
// const limiterDefaultRequests = createLimiter(15);
router.get('/:dergiId', async (req, res) => {
    const dergiId = req.params.dergiId;
    const userS = req.session.user;

    try {
        // Sequelize ile dergi bilgilerini çek
        const dergi = await Dergiler.findByPk(dergiId, {
            include: [{
                model: Users,
                as: 'olusturanUser',
                attributes: ['first_name', 'last_name'],
            }],
        });
        const olusturanUser = dergi.olusturanUser;
        // Sequelize ile dergi yorumlarını çek
        const dergiYorumlari = await Yorumlar.findAll({
            where: {
                dergi_id: dergiId
            },
            include: [{
                model: Users,
                attributes: ['first_name'],
            }]
        });
        console.log(dergiYorumlari);

        // Dergi sayfasını render et
        res.render('dergiDetay', { dergi, userS, dergiYorumlari,olusturanUser });
    } catch (error) {
        // Hata durumunda
        console.error('Dergi ve yorum verilerini çekerken bir hata oluştu: ' + error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/:dergiId/yorumsil', verifyToken, async (req, res) => {
    const userS = req.session.user;
    const yorumId = req.body.yorumId;
    const dergiId = req.params.dergiId;

    if (userS && userS.role === 'admin') {
        try {
            // Sequelize ile yorumu bul ve sil
            const yorum = await Yorumlar.findByPk(yorumId);
            if (!yorum) {
                return res.status(404).json({ error: 'Yorum bulunamadı' });
            }

            await yorum.destroy();
            const ipAddress = req.socket.remoteAddress;
            logger.info( userS.username+' '+'Yorum Sildi: '+ipAddress);
            console.log(userS.username+' '+yorumId + ' Yorum silindi.' +'  //'+now);
            res.json({ message: yorumId + ' Yorum başarıyla silindi' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Yorum silinirken bir hata oluştu' });
        }
    } else {
        res.status(403).json({ error: 'Yetkisiz erişim' });
    }
});

// Örnek endpoint
router.post('/:dergiId/yorumEkle',postlimiter, async (req, res) => {
    const dergiId = req.params.dergiId;
    // Kullanıcının oturum açmış olup olmadığını kontrol et
    if (!req.session.user) {
        res.redirect('/auth/giris');
        return;    
    }
    
    const kullaniciId = req.session.user.id;
    const yorumMetni = req.body.yorumMetni;
    
    try {
        // Sequelize ile yorumu oluştur
        const yorum = await Yorumlar.create({
            dergi_id: dergiId,
            kullanici_id: kullaniciId,
            yorum_metni: yorumMetni
        });
        const userN = req.session.user.username;
        const ipAddress = req.socket.remoteAddress;
        logger.info( userN+' '+'Yorum Ekledi: '+ipAddress +'  //'+now);
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
