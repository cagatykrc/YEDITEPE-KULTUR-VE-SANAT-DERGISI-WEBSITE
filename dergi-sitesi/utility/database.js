const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'XLIE4244hGW-TV',
  database: 'ykvs_books',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;  