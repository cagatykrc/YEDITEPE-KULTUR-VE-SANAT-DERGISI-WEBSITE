const express = require('express');
const router = express.Router();
const db = require('../utility/database');
const Dergiler = require('../models/Dergiler');
const Kategoriler = require('../models/Kategoriler');
const Kategorilertab = require('../models/Kategorilertab');
const verifyToken = require('../utility/verifyToken');
const { getKategorilerWithTabs } = require('../models/Kategoriler');
// Ana sayfa
router.get('/hakkimizda', (req, res) =>{
    const notif = ''
    res.render('hakkimizda', { userS: req.session.user });
});

router.get('/iletisim', (req, res) =>{
    const notif = ''
    res.render('iletisim', { userS: req.session.user });
});




router.get('/', async (req, res) => {
    const userS = req.session.user;
    const kategoritabID = req.body;
    console.log(userS);
    try {
        // Sequelize ile dergi verilerini çek
        const dergiler = await Dergiler.findAll();
        // Sequelize ile kategori verilerini çek
        const kategorilers = await Kategoriler.findAll();
        const kategoriTabs = await Kategorilertab.findAll({
            include: [{
                model: Kategoriler,
                as: 'kategoriler'
            }]
        });
        console.log(kategoriTabs.kategoriler);
        // const kategorilers = await Kategoriler.findAll({
        //     where: {
        //         kategori_tab_id: kategoritabID,
        //     },
        //     include: [{
        //         model: Kategorilertab,
        //     }]
        // });
        const announcement = {title:'Site test aşamasındadır!',description:'Bu site şuan test aşamasındadır lütfen hiç bir içeriği dikkate almayınız.'}
        res.render('index', { announcement, dergiler, userS, kategoritabs: kategoriTabs, kategorilers });
    } catch (error) {
        console.error('Dergi verilerini çekerken bir hata oluştu: ' + error);
        return res.status(500).send('Internal Server Error');
    }
});
module.exports = router;