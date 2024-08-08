const User = require('./User'); // Adjust path as needed
const Conversation = require('./Conversation');
const Message = require('./Message');

// Define associations
Conversation.belongsTo(User, { as: 'Participant', foreignKey: 'participantId' });
User.hasMany(Conversation, { foreignKey: 'participantId' });

Conversation.belongsToMany(User, { through: 'ConversationParticipants', foreignKey: 'conversationId', otherKey: 'userId' });
User.belongsToMany(Conversation, { through: 'ConversationParticipants', foreignKey: 'userId', otherKey: 'conversationId' });

Conversation.belongsTo(Message, { foreignKey: 'lastMessage' });
Message.hasMany(Conversation, { foreignKey: 'lastMessage' });

module.exports = { User, Conversation, Message };
