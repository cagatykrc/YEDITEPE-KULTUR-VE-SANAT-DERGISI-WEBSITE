// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(32).toString('hex');
// const dotenv = require('dotenv');
// const cookieParser = require('cookie-parser');
// require('dotenv').config();
const verifyToken = (req, res, next) => {
//     console.log(req.cookies);
//     const token = req.cookies && req.cookies.token;

//     if (!token) {
//         return res.status(403).json({ error: 'Forbidden - Token not present' });
//     }

//     jwt.verify(token, '22b15b3b483df486d3fe2f2f01f5de51c6ac0e527d34d12b571e1c205ae41fb0', (err, user) => {
//         if (err) {
//             return res.status(403).json({ error: 'Forbidden - Invalid token' });
//         }

//         req.user = user;

//         if (req.user.role === 'admin') {
//             next();
//         } else {
//             return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
//         }
//     });
next();
};


module.exports = verifyToken;