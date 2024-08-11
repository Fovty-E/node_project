const Conversation = require('../model/Conversation'); // Adjust the path as needed
const { Op } = require('sequelize')
const db = require('../model')

async function createConversation(participants) {
    // Ensure participants are integers or appropriate type (e.g., UUIDs)
    // In this case, we're assuming integers; adjust if you're using UUIDs or another type.
    const participantIds = participants.map(participant => parseInt(participant, 10));

    try {
        const conversation = await Conversation.create({ participants: participantIds });
        return conversation;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
}

async function getConversationId(user1Id, user2Id) {
    try {
        const conversation = await Conversation.findOne({
            where: {
                participants: {
                    [Op.contains]: [user1Id, user2Id]  // Check if the array contains just user1Id
                }
            }
        });
        if (conversation && conversation.participants.includes(user2Id)) {
            return conversation.hash_id;
        }

        return null;
    } catch (error) {
        console.error('Error retrieving conversation ID:', error);
        throw error;
    }
}



module.exports = { createConversation, getConversationId };
