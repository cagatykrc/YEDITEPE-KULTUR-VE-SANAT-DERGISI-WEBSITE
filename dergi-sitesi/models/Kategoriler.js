const { DataTypes } = require('sequelize');
const sequelize = require('../utility/database');

const Kategoriler = sequelize.define('Kategoriler', {
    kategori_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    kategori_ad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    kategori_low: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    // Modelin ayarlarını belirle
    tableName: 'kategoriler', // Veritabanında kullanılacak tablo adı
    timestamps: true, // Oluşturma ve güncelleme tarih alanları ekler
});

module.exports = Kategoriler;