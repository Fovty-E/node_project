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
        const userId = req.userId;
        const receiverId = Number(req.body.receiverId);
        let conversationId = await getConversationId(userId, receiverId);
        if (!conversationId) {
            const conversation = await createConversation([userId, receiverId]);
            conversationId = conversation.hash_id; // Use 'id' as the primary key field
        }

        const messages = await Message.findAll({
            where: { conversationId },
            // attributes: ['sender', 'text', 'timestamp'],
            deletedBy: {
                [Op.or]: [
                    null,
                    { [Op.not]: [userId] }
                ],
            },
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
        const userId = req.userId
        console.log(conversationId)
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
        const conversation = await Conversation.findOne({where: {hash_id:conversationId}});
        const lastMessage = conversation.lastMessage || {};
        lastMessage[userId] = message.id;
        lastMessage[receiverId] = message.id;
        console.log(lastMessage)
        // // Update the last message in the conversation
        await Conversation.update(
            { lastMessage, updatedAt: new Date() },
            { where: { hash_id: conversationId } }
        );
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

const deleteMessage = async (req, res) => {
    if(!req?.body?.id) return res.sendStatus(400)
        const messageId = req.body.id;
        
            const userId = req.userId;
            const message = await Message.findOne({
                where: {id: messageId},
                attributes: ['id','conversationId', 'deletedBy']
            })
            console.log(message.deletedBy)
            if (message.deletedBy == null) {
                message.deletedBy = [ userId ];
                await message.save()
                
            }else{
                
                await Message.destroy({
                    where: {
                        id: messageId
                    }
                })
                
               
            }
            const conversation = await Conversation.findOne({
                where: {hash_id: message.conversationId },
               })
               if (conversation) {
                   const previousMessage = await Message.findOne({
                       where: {
                           conversationId: conversation.hash_id,
                           id: { [Op.lt]: messageId }
                       },
                       deletedBy: {
                        [Op.or]: [
                            null,  // Messages not deleted by anyone
                            { [Op.not]: [userId] } // Messages not deleted by this user
                        ]
                    },
                    order: [['id', 'DESC']],
                    attributes: ['id']
                   });
                   
                   const lastMessage = conversation.lastMessage || {};
                   if (previousMessage) {
                       conversation.lastMessage[userId] = previousMessage.id;
                   } else {
                       // Remove the user's lastMessage entry if no previous message is found
                       conversation.lastMessage[userId];
                   }
           
                    conversation.changed('lastMessage', true); // Explicitly mark the field as changed
                    await conversation.save();
                
               }
               return res.status(200).json({ success: true })
   
}

module.exports = { fetchDashboard, displayChatUsers, fetchMessages, sendMessage, deleteMessage }