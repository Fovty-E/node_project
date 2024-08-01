const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const path = require('path')
const refreshTokenController = require('../controllers/refreshTokenController')


router.post('/', authController.handleLogin)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','views','login.html'))
})
router.post('/refresh', refreshTokenController.handleRefreshToken)

module.exports = router