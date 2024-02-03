const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const dotenv = require('dotenv');
const limiter = require('./utility/limiter');
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

const app = express();


require('dotenv').config();

console.log(secretKey);
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1 * 24 * 60 * 60 * 1000,
    },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiter);

// Sequelize modellerini senkronize et
(async () => {
    try {
        await sequelize.sync({force: true});
        console.log('Veritabanı modelleri senkronize edildi');
        
        const PORT = 3000;
        app.listen(PORT, "0.0.0.0", () => {
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
