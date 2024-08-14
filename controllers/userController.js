const { Op } = require('sequelize');
const User = require('../model/User')
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const createConversation = require('../utils/conversations').createConversation
const getConversationId = require('../utils/conversations').getConversationId


const fetchDashboard = async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ 
        where: { refreshToken } 
    })
    if(!foundUser || foundUser == null) return res.sendStatus(400) // Bad request
    const { username, email, firstname, lastname } = foundUser
    const userId = foundUser._id
    res.json({username, email, userId, firstname, lastname})
}

const displayChatUsers = async (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ 
        where: { refreshToken } 
    })
    // Find other users (excluding the current user)
    const friends = await User.findAll({
        where: {
            username: {
                [Op.ne]: foundUser.username
            }
        },
        attributes: ['id', 'username', 'email']
    });
    res.json({userid: foundUser.id, friends})
}

const fetchMessages = async (req, res) => {
    try {
        const userId = req.session.userId;
        const receiverId = Number(req.body.receiverId);
        let conversationId = await getConversationId(userId, receiverId);
        if (!conversationId) {
            const conversation = await createConversation([userId, receiverId]);
            conversationId = conversation.hash_id; // Use 'id' as the primary key field
        }

        const messages = await Message.findAll({
            where: { conversationId },
            // attributes: ['sender', 'text', 'timestamp'],
            order: [['timestamp', 'ASC']]
        });

        if (messages.length < 1) return res.status(200).json({ conversationId, NoMessage: 'Send a message to start a conversation' });
        
        res.status(200).json({ userId, conversationId, messages });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}


const sendMessage = async (req, res) => {
    const { conversationId, receiverId, text } = req.body;
    try {
        const files = req.files ? req.files.map(file => file.filename) : [];
        const userId = req.session.userId

        const message = await Message.create({
            conversationId,
            sender: userId,
            receiver: receiverId,
            text,
            files,
            timestamp: new Date() // Sequelize will automatically add this if using `timestamps: true`
        });

        const { id, sender, timestamp } = message;
        // Emit the message to the relevant conversation
        req.io.to(conversationId).emit('message', message);
       
        // // Update the last message in the conversation
        await Conversation.update(
            { lastMessage: message.id, updatedAt: new Date() },
            { where: { hash_id: conversationId } }
        );
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

const deleteChat = async (req, res) => {
    if(!req?.body?.id) return res.sendStatus(400)
        console.log(req.body)
        // const chatId = req.body.id;
        // Message.destroy({
        //     where: {
        //         id: chatId
        //     }
        // }).then(()=>{
        //     return res.status(200).json({ status: 'success' })
        // }).catch((err) => {
        //     console.error('Error deleting user:', err);
        // })
   
}

module.exports = { fetchDashboard, displayChatUsers, fetchMessages, sendMessage, deleteChat }