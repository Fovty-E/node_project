const User = require('../model/User');
const fsPromises = require('fs').promises;
const path = require('path');



const handleLogout =  async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(204); // no content
    const refreshToken = cookies.jwt

    // Is refreshToken in db
    const foundUser = await User.findOne({ refreshToken }).exec()

    if(!foundUser){
        res.clearCookie('jwt', { httpOnly: true })
         return res.sendStatus(204) //Unauthorized
    }
    
    // Delete  refreshToken in db
    foundUser.refreshToken = '';
    await foundUser.save()
 
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }) // secure: true - only serves on https
    res.sendStatus(204);
}

module.exports = { handleLogout }