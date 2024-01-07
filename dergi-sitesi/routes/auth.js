const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../utility/database');

router.get('/giris', (req, res) => {
  const userS = req.session.user;
  if (userS) {
    res.redirect('/')
  }
  else{
    res.render('giris', {userS});
  }
});

router.post('/kayit', async (req, res) => {
    const username = req.body.username;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    try {
        console.log(username, firstName, lastName, email, password);

        // Salt değerini oluştur
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        if (!salt) {
            throw new Error('Salt oluşturulamadı.');
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, salt);

        // Kullanıcıyı veritabanına ekle
        
        const result = await db.query('INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, firstName, lastName]);

      
        // Başarı durumunda kullanıcıya cevap gönder
        res.redirect('/')
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Bir hata oluştu.' });
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


router.post('/giris', async (req, res) => {
  const { username, password } = req.body;

  try {
      console.log(username, password);
      // Kullanıcıyı veritabanından kontrol et
      console.log("Gelen username:", username);
      const [userArray] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      const user = userArray[0];
      console.log("Gelen user:", user);
      if (!user) {
          res.redirect('/');
      }
      // Şifreyi karşılaştır (hashli şifre)
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.redirect('/auth/giris')
      }
      // Kullanıcı bilgilerini oturumda sakla
      
      req.session.user = { 
        id: user.user_id,
        username: user.username,
        firstName: user.first_name,
        role:user.role
      };

      // Başarı durumunda kullanıcıya cevap gönder
      res.redirect('/')
  } catch (error) {
      console.error(error);
      return res.redirect('/auth/giris')
  }
});

router.post('/logout', (req, res) => {
  // Oturumu sonlandır
  req.session.destroy((err) => {
      if (err) {
          console.error(err);
          return res.redirect('/')
      }
      res.status(200).json({ message: 'Çıkış başarılı.' });
  });
});

module.exports = router;