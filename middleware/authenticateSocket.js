const jwt = require('jsonwebtoken');
const User = require('../model/User')

const authenticateSocket = (socket, next) => {
  
  const token = socket.handshake.auth.token
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return next(new Error('Unauthorized'));
      }
      console.log(decoded.UserInfo.username)
      const foundUser = await User.findOne({ where: {username:decoded.UserInfo.username }})
      // Attach user information to the socket object
      socket.username = foundUser.username;
      socket.userId = foundUser.id;
      // socket.user = decoded; // Optional: Attach the entire decoded payload
      next();
    });
  } else {
    next(new Error('No token provided'));
  }
};

module.exports = authenticateSocket;