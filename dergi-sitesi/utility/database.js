const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'XLIE4244hGW-TV',
    database: 'ykvs_books',
    multipleStatements: true, // Bu satırı ekleyin
});

module.exports= db;