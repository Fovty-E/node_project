const { Conversation } = require('../model'); // Adjust the path as needed

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
                    [Op.contains]: [user1Id, user2Id] // Using Op.contains for array fields
                }
            }
        });

        return conversation ? conversation.id : null; // 'id' is the default primary key field name in Sequelize
    } catch (error) {
        console.error('Error retrieving conversation ID:', error);
        throw error;
    }
}

module.exports = { createConversation, getConversationId };
