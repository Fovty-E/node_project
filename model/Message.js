const { DataTypes, Model } = require('sequelize');
const {sequelize} = require('./'); // Adjust path as needed

class Message extends Model {}

Message.init({
    conversationId: {
        type: DataTypes.UUID, // Change to INTEGER if your Conversation ID is numeric
        references: {
            model: 'Conversations', // This should be the table name of the Conversation model
            key: 'hash_id'
        },
        allowNull: true
    },
    sender: {
        type: DataTypes.INTEGER, // Change to INTEGER if your User ID is numeric
        references: {
            model: 'Users', // This should be the table name of the User model
            key: 'id'
        },
        allowNull: false
    },
    receiver: {
        type: DataTypes.INTEGER, // Change to INTEGER if your User ID is numeric
        references: {
            model: 'Users', // This should be the table name of the User model
            key: 'id'
        },
        allowNull: false
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    files: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Message', // Model name
    timestamps: false // You can enable this if you want createdAt and updatedAt fields
});

module.exports = Message;
