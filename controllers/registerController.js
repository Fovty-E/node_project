const User = require('../model/User')
const bcrypt = require('bcrypt')

const handleNewUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if(!username || !email || !password || !confirmPassword ) return res.status(400).json({'message': 'All fields are required.'})

    if(password !== confirmPassword) return res.status(400).json({ 'message':'Password do not match' })
    //check for duplicate usernames in the db
    const duplicateUser = await User.findOne({ username }).exec(); // use name:username if key and value are different
    const duplicateEmail = await User.findOne({ email }).exec(); // use name:username if key and value are different

    if(duplicateUser) return res.status(400).json({ 'message':'Username has been taken' })
    if(duplicateEmail) return res.status(400).json({ 'message':'Email has been taken' })
    try {
        //encrypt the password
        const hashedPwd =  await bcrypt.hash(password, 10)
        //Create and store the new user
        const result = await User.create({ 
            "username": username,            
            "email": email,            
            "password": hashedPwd,
          });

        console.log(result)
        res.status(201).json({ 'message': `New user ${username} created!` })
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { handleNewUser }