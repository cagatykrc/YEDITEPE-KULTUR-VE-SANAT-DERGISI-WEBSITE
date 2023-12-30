const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../utility/database');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));



router.get('/giris', (req, res) => {
    res.render('giris'); // giris.ejs şablonunu kullanarak giriş sayfasını göster
  });
// Kullanıcı kaydı
router.post('/kayit', async (req, res) => {
  const username = req.body.username;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

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
    const result = await db.query('INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, firstName, lastName]);

    // Başarı durumunda kullanıcıya cevap gönder
    res.status(200).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});
router.get('/kayit', (req, res)=>{
  res.render('kayit');
});

// Kullanıcı girişi
router.post('/giris', (req, res) => {
  const { username, password } = req.body;

  try {
    // Kullanıcıyı veritabanından kontrol et
    const [user] =  db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı veya geçersiz şifre.' });
    }

    // Şifreyi karşılaştır (hashli şifre)
    const passwordMatch = bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı veya geçersiz şifre.' });
    }

    // Kullanıcı bilgilerini oturumda sakla
    req.session.user = { id: user.id, username: user.username };

    // Başarı durumunda kullanıcıya cevap gönder
    res.status(200).json({ message: 'Giriş başarılı.', user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});

// Kullanıcı çıkışı
router.post('/logout', (req, res) => {
  // Oturumu sonlandır
  req.session.destroy();
  res.status(200).json({ message: 'Çıkış başarılı.' });
});

module.exports = router;