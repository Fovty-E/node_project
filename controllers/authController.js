const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');

const handleLogin =  async (req, res) => {
    const { username, password } = req.body
    if(!username || !password) return res.status(400).json({'message': 'Username and password are required'});
    // Simple regex to check if input is an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Determine if the input is an email
    const isEmail = emailRegex.test(username);

    // Query the database based on input type
    let query = {};
    if (isEmail) {
        query.email = username;
    } else {
        query.username = username;
    }
    const foundUser = await User.findOne(query)
    
    if(!foundUser) return res.sendStatus(400) //Unauthorized
    // evaluate password
    const match = await bcrypt.compare(password, foundUser.password)
    if (match) {
        console.log(foundUser)
        if(!foundUser.verified || foundUser.verified == 0) return res.status(403).json({message: `Account not verified, check your email for a verification mail from us or <a href="#" onclick="resendVerification('${foundUser._id}')">click here</a>`})
        const roles = Object.values(foundUser.roles);
        // create JWTs
        const accessToken = jwt.sign(
            { 
                "UserInfo":{
                "username": foundUser.username,
                "email": foundUser.email,
                "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10m' }
        )
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        )
        // Update the user's refreshToken in the DB
        foundUser.refreshToken = refreshToken
        await foundUser.save()

        // Find other users (excluding the current user)
        const otherUsers = await User.findAll({
            where: {
                username: {
                    [Op.ne]: foundUser.username
                }
            }
        });
        
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000}); // secure: true
        req.session.userId = foundUser._id; // Store user ID in session
        res.json({ accessToken })
    } else {
        res.status(401).json({'message':'Login credentials not valid'})
    }
}

module.exports = { handleLogin }