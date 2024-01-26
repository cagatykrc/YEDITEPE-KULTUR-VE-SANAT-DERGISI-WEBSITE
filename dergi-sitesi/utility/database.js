const mysql = require('mysql2/promise');
require('dotenv').config();
const db = mysql.createPool({
  host: '172.31.43.129',
  user: 'root',
  password: 'XLIE4244hGW-TV',
  database: 'ykvs_books',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;  