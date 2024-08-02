const User = require('../model/User')
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const createConversation = require('../utils/conversations').createConversation
const getConversationId = require('../utils/conversations').getConversationId
const mongoose = require('mongoose');

const fetchDashboard = async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken }).exec()
    if(!foundUser) res.sendStatus(400) // Bad request
    const { username, email } = foundUser
    res.json({username, email})
}

const displayChatUsers = async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken }).exec()
    // Find other users (excluding the current user)
    const friends = await User.find({username: { $ne: foundUser.username }}, '_id username email').exec();
    res.json(friends)
}

const fetchMessages = async (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.body.receiverId;
    
    console.log(req.body)
    try {
        let conversationId = await getConversationId(senderId, receiverId);
        console.log(conversationId)
        if(!conversationId) {
            conversation = await createConversation([senderId, receiverId]);
            conversationId = conversation._id
            console.log('new '+conversationId)
            // return res.status(200).json({ NoMessage: 'Send a message to start a conversation' });
        }
        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 }).exec();
        if(!messages) return res.status(200).json({ NoMessage: 'Send a message to start a conversation' });
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = { fetchDashboard, displayChatUsers, fetchMessages }