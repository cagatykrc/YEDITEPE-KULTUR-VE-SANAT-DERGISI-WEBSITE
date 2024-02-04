const rateLimit = require('express-rate-limit');

// const createLimiter = (maxRequests) => {
//     return rateLimit({
//       windowMs:   15 * 1000,
//       max: maxRequests,
//       message: 'Too many requests from this IP, please try again later.'
//     });
//   };
  const createLimiter=1
  module.exports = createLimiter;