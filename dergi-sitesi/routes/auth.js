const express = require('express');
const router = express.Router();
const postlimiter = require('../utility/limiter');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const dotenv = require('dotenv');
const { default: rateLimit } = require('express-rate-limit');
const { Sequelize, Op } = require('sequelize');
require('dotenv').config();
// const limiterTwoRequests = createLimiter(2);
// const limiterDefaultRequests = createLimiter(15);
router.get('/giris', (req, res) => {
  const userS = req.session.user;
  if (userS) {
    res.redirect('/')
  }
  else{
    res.render('giris', {userS});
  }
});

router.post('/kayit', postlimiter, async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;
  const userS = req.session.user;
  // Kullanıcı adı ve e-posta adresi var mı kontrol et
  const existingUser = await Users.findOne({
      where: {
          [Op.or]: [
              { username: username },
              { email: email }
          ]
      }
  });

  if (existingUser) {
      // Kullanıcı adı veya e-posta zaten kullanılmışsa hata gönder
      console.log('hatalı');
       res.render('kayit',  {userS,message:'Bu kullanıcı adı veya e-posta zaten kullanımda',messagecolor:'#FF0000'});
       return
  }
  else{
    try {
  
        // Salt değerini oluştur
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
  
        if (!salt) {
            throw new Error('Salt oluşturulamadı.');
        }
  
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, salt);
  
        // Kullanıcıyı veritabanına ekle
        const newUser = await Users.create({
            username,
            email,
            password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            role: 'user'
        });
  
        // Başarı durumunda kullanıcıya cevap gönder
        res.redirect('/auth/giris');
    } catch (error) {
        console.error(error);
  
        // Kullanıcı dostu bir hata mesajı gönder
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
    
  }
});



  
  
  
  router.get('/kayit', (req, res) => {
    const userS = req.session.user;
    if (userS) {
    res.redirect('/')
  }else{
    res.render('kayit', {userS});
  }
});


router.post('/giris', postlimiter,  async (req, res) => {
  const userS = req.session.user;
  const { username, password } = req.body; // Token'ı req.body üzerinden al
  console.log(process.env.ACCESS_TOKEN_SECRET);
  try {
    console.log(username, password);
    // Kullanıcıyı veritabanından kontrol et
    console.log("Gelen username:", username);
    const user = await Users.findOne({ where: { username } });
    if (!user) {
      res.render('giris',  {userS,message:'Kullanıcı adı bulunamadı', messagecolor:'#FF0000'});
      return; // Username not found, redirect to login page
  }
    

      // Eğer token varsa ve geçerliyse, kullanıcı bilgilerini oturumda sakla
      // if (token) {
      //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      //         if (!err && decoded.userId === user.user_id) {
      //             req.session.user = {
      //                 id: user.user_id,
      //                 username: user.username,
      //                 firstName: user.first_name,
      //                 role: user.role
      //             };

      //             // Başarı durumunda kullanıcıya cevap gönder
      //             // res.cookie('token', token, { httpOnly: true, secure: false });
      //             return res.redirect('/');
      //         } else {
      //             // Token geçerli değilse veya kullanıcı eşleşmiyorsa
      //             console.error('Token verification failed or user mismatch');
      //             return res.redirect('/auth/giris');
      //         }
      //     });
      // } else {
          // Token yoksa, şifreyi karşılaştır (hashli şifre)
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            res.render('giris',  {userS,message:'Hatalı Şifre!', messagecolor:'#FF0000'});
            return;
          }

          // Kullanıcı bilgilerini oturumda sakla
          // const newToken = jwt.sign({ userId: user.user_id, username: user.username, role: user.role }, '22b15b3b483df486d3fe2f2f01f5de51c6ac0e527d34d12b571e1c205ae41fb0', { expiresIn: '120s' });
          req.session.user = {
              id: user.user_id,
              username: user.username,
              firstName: user.first_name,
              role: user.role
          };

          // Başarı durumunda kullanıcıya cevap gönder
          // res.cookie('token', newToken, { httpOnly: true, secure: false });
          return res.redirect('/');
      }
   catch (error) {
      console.error(error);
      return res.redirect('/auth/giris');
  }
});
  
  
  router.post('/cikis', (req, res) => {
    const userS = req.session.user;
    if (userS){
      req.session.destroy();
      // res.clearCookie('token'); // Token cookie'sini temizle
      res.redirect('/');
    }
    else{
          res.redirect('/');
        }
  });
module.exports = router;
