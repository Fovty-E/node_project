const User = require('../model/User')
const bcrypt = require('bcrypt')
const formatHelper = require('./formatHelper')
const sendEmail = require('../utils/mailer')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')


const handleNewUser = async (req, res) => {
    const { firstname, lastname, username, email, password, confirmPassword } = req.body;
    if(!firstname, !lastname, !username || !email || !password || !confirmPassword ) return res.status(400).json({'message': 'All fields are required.'})

    if(password !== confirmPassword) return res.status(400).json({ 'message':'Password do not match' })
    //check for duplicate usernames in the db
    const duplicateUser = await User.findOne({ where: { username }}); // use name:username if key and value are different
    const duplicateEmail = await User.findOne({ where: {email} }); // use name:username if key and value are different

    if(duplicateUser) return res.status(400).json({ 'message':'Username has been taken' })
    if(duplicateEmail) return res.status(400).json({ 'message':'Email has been taken' })
    try {
        //encrypt the password
        const hashedPwd =  await bcrypt.hash(password, 10)
        const result = await User.create({ 
            "firstname": formatHelper.capitalizeFirst(firstname),            
            "lastname": formatHelper.capitalizeFirst(lastname),            
            "username": username.toLowerCase(),            
            "email": email,            
            "password": hashedPwd
        });

        console.log(result)
        const userId = result.id
        if (result) {
            //Create and store the new user
            
            
            var token = jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET, {expiresIn: '10m'})
            var verificationUrl = `${process.env.SITE_URL}/register/verify?token=${token}`
            var subject = 'Account Verification'
            var text = `Hello ${firstname},\n\nThank you for registering with our service!`
            var html = `<p>Hello ${username},</p><p>Thank you for registering with our service!</p>
                        <br>
                        <p>Click on link below to verify your account</p><br><a href="${verificationUrl}" target="_blank">${verificationUrl}</a> 
                        `
        const mailSent = await sendEmail(email, subject, text, html)
            
        }
        res.status(201).json({ 'message': `New user ${username} created! if you didn't get a verification mail <a href="#" onclick="resendVerification(${userId})">Click Here</a>` })
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const resendVerification = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(`${req.body.userId}`)
    const foundUser = await User.findById(userId)
    if(!foundUser) return res.sendStatus(401)
    const { firstname, lastname, username, email } = foundUser
        var token = jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET, {expiresIn: '10m'})
        var verificationUrl = `${process.env.SITE_URL}/register/verify?token=${token}`
        var subject = 'Account Verification'
        var text = `Hello ${firstname},\n\nThank you for registering with our service!`
        var html = `<p>Hello ${username},</p><p>Thank you for registering with our service!</p>
                    <br>
                    <p>Click on link below to verify your account</p><br><a href="${verificationUrl}" target="_blank">${verificationUrl}</a> 
                    `
    const mailSent = await sendEmail(email, subject, text, html)
    res.status(200).json({ message: 'Email Sent' })
}

const handleVerifyToken = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    console.log(decoded);
    const user = await User.findByPk(decoded.userId)
    if(!user) return res.sendStatus(400)
    user.verified = 1;
    user.save()
    res.status(200).json({ message: 'Email verified successfully' });
    console.log(user)
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token has expired' });
        }
        console.error('Token verification failed:', error);
        res.status(400).json({ message: 'Invalid token' });
    }
    
}

module.exports = { handleNewUser, resendVerification, handleVerifyToken }