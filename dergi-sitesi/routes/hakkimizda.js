const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const hakkimizdaData = {
        hakkimizdaBaslik: 'Hakkımızda',
        hakkimizdaMetin1: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Explicabo, vitae facere.',
        hakkimizdaMetin2: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos, hic.',
    };

    res.render('hakkimizda', hakkimizdaData);
});

module.exports = router;
