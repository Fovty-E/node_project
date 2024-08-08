const { DataTypes, Model } = require('sequelize');
const {sequelize} = require('./'); // Adjust path as needed

class Message extends Model {}

Message.init({
    conversationId: {
        type: DataTypes.INTEGER, // Change to INTEGER if your Conversation ID is numeric
        references: {
            model: 'Conversations', // This should be the table name of the Conversation model
            key: 'id'
        },
        allowNull: false
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
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Message', // Model name
    tableName: 'messages', // Optional: Specify the table name if different from the model name
    timestamps: false // You can enable this if you want createdAt and updatedAt fields
});

module.exports = Message;
