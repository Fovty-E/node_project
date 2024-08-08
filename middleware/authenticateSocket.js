const jwt = require('jsonwebtoken');
const User = require('../model/User')

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token
    console.log(token)
  if (token) {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return next(new Error('Unauthorized'));
      }
      const foundUser = await User.findOne({ where: {refreshToken:token }})
      console.log(foundUser)
      // Attach user information to the socket object
      socket.userId = foundUser.id;
      // socket.user = decoded; // Optional: Attach the entire decoded payload
      next();
    });
  } else {
    next(new Error('No token provided'));
  }
};

module.exports = authenticateSocket;