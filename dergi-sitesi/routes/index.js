const express = require('express');
const router = express.Router();
const db = require('../utility/database');

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
    try {
        // MySQL sorgusu ile dergi verilerini çek
        const [rows, fields] = await db.query('SELECT * FROM dergiler');
        const dergiler = rows;
        res.render('index', { dergiler, userS });
    } catch (error) {
        console.error('Dergi verilerini çekerken bir hata oluştu: ' + error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;