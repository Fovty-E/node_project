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
    if(!foundUser || foundUser == null) return res.sendStatus(400) // Bad request
    const { username, email, firstname, lastname } = foundUser
    const userId = foundUser._id
    res.json({username, email, userId, firstname, lastname})
}

const displayChatUsers = async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken }).exec()
    // Find other users (excluding the current user)
    const friends = await User.find({username: { $ne: foundUser.username }}, '_id username email').exec();
    res.json({userid: foundUser._id, friends})
}

const fetchMessages = async (req, res) => {
    
    try {
        const userId = req.session.userId;
    
        const receiverId = req.body.receiverId;
        let conversationId = await getConversationId(userId, receiverId);
        
        if(!conversationId) {
            conversation = await createConversation([userId, receiverId]);
            conversationId = conversation._id
            // return res.status(200).json({ NoMessage: 'Send a message to start a conversation' });
        }
        const messages = await Message.find({ conversationId }).select('sender text timestamp').sort({ timestamp: 1 }).exec();
        if(messages.length < 1 ) return res.status(200).json({ conversationId, NoMessage: 'Send a message to start a conversation' });
        res.status(200).json({userId, conversationId, messages})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const sendMessage = async (data, socket, userId) => {
    const { conversationId, receiverId, text } = data;
    // Convert conversationId and receiverId to ObjectId
    console.log('con '+receiverId)
    const conversationObjectId = new mongoose.Types.ObjectId(`${conversationId}`);
    const receiverObjectId = new mongoose.Types.ObjectId(`${receiverId}`);
    // Create a new message
    const message = new Message({
        conversationId: conversationObjectId,
        sender: userId,
        receiver: receiverObjectId,
        text
    });

    try {
        // Save the message to the database
        let savedMessage = await message.save();
        savedMessage.userId = savedMessage.sender
        const {_id, text, sender, timestamp} = savedMessage
        // Emit the message to the relevant conversation
        socket.to(conversationId).emit('message', {_id, text, sender, timestamp, userId});
        await Conversation.findOneAndUpdate(
            { _id: conversationObjectId }, 
            {lastMessage: savedMessage._id, updatedAt: Date.now()},                     
            { new: true,                    
              runValidators: true }  
        );
    } catch (error) {
        console.error('Error saving message:', error);
    }
}
module.exports = { fetchDashboard, displayChatUsers, fetchMessages, sendMessage }