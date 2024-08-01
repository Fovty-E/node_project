const express = require('express')
const router = express.Router()
const path = require('path')
const userController = require('../../controllers/userController')

router.post('/dashboard',userController.fetchDashboard)
router.post('/chat',userController.displayChatUsers)
router.post('/fetchConversation',userController.fetchConversation)

module.exports = router