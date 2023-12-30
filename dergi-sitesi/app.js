// app.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./utility/database');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const app = express();

app.use(session({
    secret: 'sa',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/auth', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));

const indexRoute = require('./routes/index');
const dergiRoute = require('./routes/dergi');


app.use('/', indexRoute);
app.use('/dergiler', dergiRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
