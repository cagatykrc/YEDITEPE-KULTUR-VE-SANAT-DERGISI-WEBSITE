const { DataTypes } = require('sequelize');
const sequelize = require('../utility/database');
const Yorumlar = require('./Yorumlar');
const Users = require('./Users');
const Dergiler = sequelize.define('Dergiler', {
    dergi_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    konu: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    aciklama: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    resim: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    indirme_linki: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    olusturan_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    dergi_basligi: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pdf_dosya: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    yazar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    kategorisi: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dergi_turu: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    // Modelin ayarlarını belirle
    tableName: 'dergiler', // Veritabanında kullanılacak tablo adı
    timestamps: true, // Oluşturma ve güncelleme tarih alanları ekler
});

Dergiler.hasMany(Yorumlar, { as: 'yorumlar', foreignKey: 'dergi_id', onDelete: 'CASCADE' });
Yorumlar.belongsTo(Dergiler, { as: 'dergiler', foreignKey: 'dergi_id' });
Dergiler.belongsTo(Users, { foreignKey: 'olusturan_user_id', as: 'olusturanUser' });

const getDergiById = async (dergiId) => {
    try {
        const dergi = await Dergiler.findByPk(dergiId);
        return dergi;
    } catch (error) {
        console.error('Dergi bilgisi alınırken bir hata oluştu: ' + error);
        throw error;
    }
};

module.exports = Dergiler;
