const express = require('express')
const router = express.Router()
const path = require('path')
const userController = require('../../controllers/userController')
const upload = require('../../config/multerConfig')

router.post('/dashboard',userController.fetchDashboard)
router.post('/chat',userController.displayChatUsers)
router.post('/fetchMessages',userController.fetchMessages)
router.post('/sendMessage',upload.array('files', 5), userController.sendMessage)

module.exports = router