const express = require('express');
const router = express.Router();

// Giriş Sayfası
router.get('/giris', (req, res) => {
    res.render('giris', { title: 'Giriş Yap' });
});

// Kayıt Sayfası
router.get('/kayit', (req, res) => {
    res.render('kayit', { title: 'Kayıt Ol' });
});

module.exports = router;