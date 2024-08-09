const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    // if (req.path === '/socket.io/socket.io.js') {
    //     return next();
    // }
    const authHeader =  req.headers.authorization || req.headers.Authorization;
    // console.log(`Request to ${req.path} at ${new Date().toISOString()}`);
    // console.log(`Header to ${authHeader} `);

    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401)
    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403); // invalid token
            req.user = decoded.UserInfo.username;
            // req.userId = decoded.UserInfo._id;
            req.roles = decoded.UserInfo.roles;
            next();
        }
    )
}

module.exports = verifyJWT