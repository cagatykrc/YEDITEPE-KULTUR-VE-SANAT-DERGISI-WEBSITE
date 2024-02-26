const express = require('express');
const router = express.Router();
const Dergiler = require('../models/Dergiler');
const Kategoriler = require('../models/Kategoriler');
const Kategorilertab = require('../models/Kategorilertab');
const verifyToken = require('../utility/verifyToken');
const nodemailer = require('nodemailer');
const Duyurular = require('../models/Duyurular');
// Ana sayfa
router.get('/hakkimizda', (req, res) =>{
    const notif = ''
    res.render('hakkimizda', { userS: req.session.user });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nazimkogce@gmail.com', // E-posta adresinizi buraya girin
      pass: 'your-password' // E-posta şifrenizi buraya girin
    }
  });


router.get('/iletisim', (req, res) =>{
    const notif = ''
    res.render('iletisim', { userS: req.session.user });
});

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // E-posta gönderilecek ayarlar
  const mailOptions = {
    from: 'your-email@gmail.com', // Gönderen e-posta adresi
    to: 'recipient-email@example.com', // Alıcı e-posta adresi
    subject: 'İletişim Formu Mesajı',
    text: `Ad: ${name}\nE-posta: ${email}\nMesaj: ${message}`
  };

  // E-posta gönderme işlemi
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('E-posta gönderilemedi:', error);
    }
    console.log('E-posta gönderildi:', info.response);
    res.send('Mesajınız başarıyla gönderildi.');
  });
});


router.get('/', async (req, res) => {
    const message = req.session.message;
    delete req.session.message;
    const userS = req.session.user;
    const kategoritabID = req.body;
    try {
        const dergiler = await Dergiler.findAll();
        const duyurular = await Duyurular.findAll();
        const kategoriTabs = await Kategorilertab.findAll({
            include: [{
                model: Kategoriler,
                as: 'kategoriler'
            }],
            order: [

                [{ model: Kategoriler, as: 'kategoriler' }, 'kategori_ad', 'ASC']
        
              ]
        });
        // const kategorilers = await Kategoriler.findAll({
        //     where: {
        //         kategori_tab_id: kategoritabID,
        //     },
        //     include: [{
        //         model: Kategorilertab,
        //     }]
        // });
        const announcement = {title:'Site test aşamasındadır!',description:'Bu site şuan test aşamasındadır lütfen hiç bir içeriği dikkate almayınız.'}
        console.log(message);
        res.render('index', { duyurular, dergiler, userS,message, kategoriTabs: kategoriTabs});
    } catch (error) {
        console.error('Dergi verilerini çekerken bir hata oluştu: ' + error);
        return res.status(500).send('Internal Server Error');
    }
});
module.exports = router;