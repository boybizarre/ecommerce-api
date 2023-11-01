// // const { expressJwt } = require('express-jwt');
// const { expressjwt: expressJwt } = require('express-jwt');

// const authJwt = () => {
//   const secret = process.env.JWT_SECRET;
//   const apiURL = process.env.API_BASE_URL;

//   return expressJwt({
//     secret,
//     algorithms: ['HS256'],
//     isRevoked: isRevokedCallback,
//   }).unless({
//     // excluding these paths from authorization
//     path: [
//       { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
//       { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
//       `${apiURL}/users/login`,
//       `${apiURL}/users/signup`,
//     ],
//   });
// };

// async function isRevokedCallback(req, payload, done) {
//   // checking if user is not an admin
//   if (payload.role !== 'admin') {
//     done(null, true);
//   }

//   // else continue
//   done();
// }

// module.exports = authJwt;
