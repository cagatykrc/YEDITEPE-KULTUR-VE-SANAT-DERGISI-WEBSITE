const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const dotenv = require('dotenv');
const createLimiter = require('./utility/limiter');
const path = require('path');
const secretKey = crypto.randomBytes(32).toString('hex');
const sequelize = require('./utility/database');
const Users = require('./models/Users');
const Yorumlar = require('./models/Yorumlar');
const Dergiler = require('./models/Dergiler');
const Kategoriler = require('./models/Kategoriler');
console.log(process.env.ACCES_TOKEN_SECRET);
const authRoutes = require('./routes/auth');
const indexRoute = require('./routes/index');
const dergiRoute = require('./routes/dergi');
const adminRoutes = require('./routes/admin');
const https = require('https');
const fs = require('fs');
const app = express();

// SSL KULLANILACAĞI ZAMAN BUNLAR YORUM SATIRINDAN ÇIKARILACAK
// const options = {
//     key: fs.readFileSync('path/to/private-key.key'),
//     cert: fs.readFileSync('path/to/certificate.crt'),
//   };
  
//   const server = https.createServer(options, app);


require('dotenv').config();
console.log(secretKey);
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, //SSL GELECEĞİ ZAMAN TRUE DİYE DEĞİŞTİRİLECEK
        maxAge: 1 * 24 * 60 * 60 * 1000,
    },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
// app.use(createLimiter);

// Sequelize modellerini senkronize et
(async () => {
    try {
        await sequelize.sync();
        console.log('Veritabanı modelleri senkronize edildi');
        
        const PORT =process.env.PORT  ||3000 ;
        //YORUM SATIRINDAN ÇIKARILACAK SSL GELDİĞİ ZAMAN
        // server.listen(PORT, "0.0.0.0", () => {
        //     console.log(`Server is running on port ${PORT}`);
        // });

        //YORUM SATIRI YAPILACAK SSL GELDİĞİ ZAMAN
            app.listen(PORT , "0.0.0.0", () => {
                console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Veritabanı modelleri senkronize edilirken bir hata oluştu:', error);
    }
})();

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/', indexRoute);
app.use('/dergiler', dergiRoute);
