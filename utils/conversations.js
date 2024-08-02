const Conversation = require('../model/Conversation');
const mongoose = require('mongoose');

async function createConversation(participants) {
    // Ensure participants are ObjectIds
    const participantIds = participants.map(participant => new mongoose.Types.ObjectId(participant));

    const conversation = new Conversation({ participants: participantIds});
    await conversation.save();
    return conversation;
}

async function getConversationId(user1Id, user2Id) {
    const conversation = await Conversation.findOne({
        participants: { $all: [user1Id, user2Id] }
    });

    return conversation ? conversation._id : null;
}

module.exports = {createConversation, getConversationId};