const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','users','dashboard.html'))
})
router.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','users','chat.html'))
})
module.exports = router