const express = require('express')
const router = express.Router()
const registerController = require('../controllers/registerController')
const path = require('path')


router.post('/', registerController.handleNewUser)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','register.html'))
})
router.post('/resendVerification', registerController.resendVerification)
router.get('/verify', registerController.handleVerifyToken)
module.exports = router