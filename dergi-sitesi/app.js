// app.js
const express = require('express');
const path = require('path');
const db = require('./utility/database.js');
const app = express();
const authRoutes = require('./routes/auth');

db.connect((err) => {
    if (err) {
        console.error('MySQL bağlantısı başarısız: ' + err.stack);
        return;
    }
    console.log('MySQL bağlantısı başarıyla sağlandı. ID: ' + db.threadId);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/auth', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRoute = require('./routes/index');
const dergiRoute = require('./routes/dergi');

app.use('/', indexRoute);
app.use('/dergiler', dergiRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});