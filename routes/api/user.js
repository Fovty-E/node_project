const express = require('express')
const router = express.Router()
const path = require('path')
const userController = require('../../controllers/userController')
const upload = require('../../config/multerConfig')

router.post('/dashboard',userController.fetchDashboard)
router.route('/chat')
        .post(userController.displayChatUsers)
        // .delete(userController.deleteMessage)
router.post('/fetchMessages',userController.fetchMessages)
router.post('/sendMessage',upload.array('files', 5), userController.sendMessage)
router.delete('/deleteMessage',upload.array('files', 5), userController.deleteMessage)
// router.delete('/deleteChat', userController.deleteChat)

module.exports = router