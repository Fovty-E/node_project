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
    
    try {
        const senderId = req.session.userId;
    
        const receiverId = req.body.receiverId;
        let conversationId = await getConversationId(senderId, receiverId);
        
        if(!conversationId) {
            conversation = await createConversation([senderId, receiverId]);
            conversationId = conversation._id
            // return res.status(200).json({ NoMessage: 'Send a message to start a conversation' });
        }
        const messages = await Message.find({ conversationId }).select('text timestamp').sort({ timestamp: 1 }).exec();
        if(messages.length < 1 ) return res.status(200).json({ conversationId, NoMessage: 'Send a message to start a conversation' });
        res.status(200).json({conversationId, messages})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const sendMessage = async (data, io, userId) => {
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
        const savedMessage = await message.save();
        // Emit the message to the relevant conversation
        io.to(conversationId).emit('message', savedMessage);
        await Conversation.findOneAndUpdate(
            { _id: conversationObjectId }, 
            {lastMessage: savedMessage._id, updatedAt: Date.now()},                     
            { new: true,                    
              runValidators: true }  
        );
        console.log('Message sent:', savedMessage);
    } catch (error) {
        console.error('Error saving message:', error);
    }
}
module.exports = { fetchDashboard, displayChatUsers, fetchMessages, sendMessage }