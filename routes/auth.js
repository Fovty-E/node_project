const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const path = require('path')

router.post('/', authController.handleLogin)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','views','login.html'))
})

module.exports = router