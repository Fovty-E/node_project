const jwt = require('jsonwebtoken');
const User = require('../model/User')

const authenticateSocket = (socket, next) => {
  
  const token = socket.request.headers.cookie
    ? socket.request.headers.cookie.split('; ').find(row => row.startsWith('jwt='))
      .split('=')[1]
    : null;
    
  if (token) {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return next(new Error('Unauthorized'));
      }
      const foundUser = await User.findOne({refreshToken:token})
      // Attach user information to the socket object
      socket.userId = foundUser._id;
      // socket.user = decoded; // Optional: Attach the entire decoded payload
      next();
    });
  } else {
    next(new Error('No token provided'));
  }
};

module.exports = authenticateSocket;