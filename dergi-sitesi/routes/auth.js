const express = require('express');
const router = express.Router();
const postlimiter = require('../utility/limiter');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const dotenv = require('dotenv');
const { Sequelize, Op } = require('sequelize');
const logger = require('../utility/logger');
const options = { timeZone: 'Europe/Istanbul' }; // Türkiye saat dilimi
const formattedDate = new Date();
const now = formattedDate.toLocaleString('tr-TR', options);
require('dotenv').config();
// const limiterTwoRequests = createLimiter(2);
// const limiterDefaultRequests = createLimiter(15);
router.get('/giris', (req, res) => {
  const userS = req.session.user;

  if (userS) {
    return res.redirect('/');
  }

  res.render('giris', { userS });
});

router.post('/kayit', postlimiter, async (req, res) => {
  const { username, firstName, lastName, email, password, verifypassword } = req.body;
  const userS = req.session.user;

  const existingUser = await Users.findOne({
    where: {
      [Op.or]: [
        { username: username },
        { email: email }
      ]
    }
  });

  if (verifypassword !== password) {
    return res.render('kayit',  {userS, message: 'Şifreler Uyuşmuyor.', messagecolor: '#FF0000'});
  }

  if (existingUser) {
    return res.render('kayit',  {userS, message: 'Bu kullanıcı adı veya e-posta zaten kullanımda', messagecolor: '#FF0000'});
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    if (!salt) {
      throw new Error('Salt oluşturulamadı.');
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: 'user'
    });

    const ipAddress = req.socket.remoteAddress;
    logger.info(username + " Adında " + 'Kayıt Oluşturuldu: ' + ipAddress + '  //' + now);
    res.redirect('/auth/giris');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});




router.get('/kayit', (req, res) => {
  const userS = req.session.user;

  if (userS) {
    return res.redirect('/');
  }

  res.render('kayit', { userS });
});



router.post('/giris', postlimiter,  async (req, res) => {
  const userS = req.session.user;
  const { email, password } = req.body; // Token'ı req.body üzerinden al
  console.log(process.env.ACCESS_TOKEN_SECRET);

  try {
    console.log(email, password);
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.render('giris',  { userS, message: 'Eposta bulunamadı', messagecolor: '#FF0000' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render('giris',  { userS, message: 'Hatalı Şifre!', messagecolor: '#FF0000' });
    }

    req.session.user = {
      id: user.user_id,
      username: user.username,
      firstName: user.first_name,
      role: user.role
    };

    const ipAddress = req.socket.remoteAddress;
    logger.info(username + " Adında Giriş Yaptı: " + ipAddress + '  //' + now);

    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return res.redirect('/auth/giris');
  }
});

  
  
router.post('/cikis', (req, res) => {
  const userS = req.session.user;

  if (!userS) {
      return res.redirect('/');
  }

  req.session.destroy();
  // res.clearCookie('token'); // Token cookie'sini temizle
  const ipAddress = req.socket.remoteAddress;
  logger.info(userS.username + ' ' + 'Çıkış Yaptı' + " " + ipAddress + '  //' + now);
  return res.redirect('/');
});



module.exports = router;
