const User = require('../model/User')
const jwt = require('jsonwebtoken')


const handleRefreshToken =  async (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    
    const foundUser = await User.findOne({ where: { refreshToken } })
    if(!foundUser) return res.sendStatus(400) //Bad request
    // evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(foundUser.roles)
            const accessToken = jwt.sign(
                { 
                    "UserInfo": {
                        "id": foundUser.id,
                        "username": decoded.username,
                        "email": foundUser.email,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' }
            );
            const userID = foundUser.id;
            res.json({ userID, accessToken })
        }
    )
 
}

module.exports = { handleRefreshToken }