const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./utility/database');
const authRoutes = require('./routes/auth');
const indexRoute = require('./routes/index');
const dergiRoute = require('./routes/dergi');
const adminRoutes = require('./routes/admin');
const app = express();
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
require('dotenv').config()

console.log(secretKey);
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
}));

// const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
// const certificate = fs.readFileSync('path/to/certificate.pem', 'utf8');
// const ca = fs.readFileSync('path/to/ca.pem', 'utf8'); // Opsiyonel, sertifika otoritesinin (CA) sertifikası

// const credentials = { key: privateKey, cert: certificate, ca: ca };

// const server = https.createServer(credentials, app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/', indexRoute);
app.use('/dergiler', dergiRoute);

const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});