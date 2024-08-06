const User = require('../model/User')
const bcrypt = require('bcrypt')
const formatHelper = require('./formatHelper')
const sendEmail = require('../utils/mailer')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');


const handleNewUser = async (req, res) => {
    const { firstname, lastname, username, email, password, confirmPassword } = req.body;
    if(!firstname, !lastname, !username || !email || !password || !confirmPassword ) return res.status(400).json({'message': 'All fields are required.'})

    if(password !== confirmPassword) return res.status(400).json({ 'message':'Password do not match' })
    //check for duplicate usernames in the db
    const duplicateUser = await User.findOne({ username }).exec(); // use name:username if key and value are different
    const duplicateEmail = await User.findOne({ email }).exec(); // use name:username if key and value are different

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
        const userId = result._id
        if (result) {
            //Create and store the new user
            
            
            var token = jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET, {expiresIn: '10m'})
            var verificationUrl = `${process.env.SITE_URL}/auth/verify?token=${token}`
            var subject = 'Account Verification'
            var text = `Hello ${firstname},\n\nThank you for registering with our service!`
            var html = `<p>Hello ${username},</p><p>Thank you for registering with our service!</p>
                        <br>
                        <p>Click on link below to verify your account</p><br><a href="${verificationUrl}" target="_blank">${verificationUrl}</a> 
                        `
        const mailSent = await sendEmail(email, subject, text, html)
            
        }
        res.status(201).json({ 'message': `New user ${username} created! if you didn't get a verification mail <a onclick="resendVerification(${userId})">Click Here</a>` })
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const resendVerification = async (req, res) => {
    console.log(req.body)
    const userId = new mongoose.Types.ObjectId(`${req.body.userId}`)
    const foundUser = await User.findById(userId)
    if(!foundUser) return res.sendStatus(401)
    const { firstname, lastname, username, email } = foundUser
        var token = jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET, {expiresIn: '10m'})
        var verificationUrl = `${process.env.SITE_URL}/auth/verify?token=${token}`
        var subject = 'Account Verification'
        var text = `Hello ${firstname},\n\nThank you for registering with our service!`
        var html = `<p>Hello ${username},</p><p>Thank you for registering with our service!</p>
                    <br>
                    <p>Click on link below to verify your account</p><br><a href="${verificationUrl}" target="_blank">${verificationUrl}</a> 
                    `
    const mailSent = await sendEmail(email, subject, text, html)
}

module.exports = { handleNewUser, resendVerification }