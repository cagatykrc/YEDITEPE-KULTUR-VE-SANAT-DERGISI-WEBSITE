const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize('ykvs_books', 'root', 'XLIE4244hGW-TV', {
  host: 'localhost',
  dialect:'mysql' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
});
module.exports = sequelize;  