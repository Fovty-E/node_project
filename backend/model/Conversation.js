const { DataTypes, Model, UUIDV4 } = require('sequelize');
const { sequelize } = require('./');

class Conversation extends Model {}

Conversation.init({
    // Array of participant IDs
    participants: {
        type: DataTypes.JSONB, // Using JSONB to store an array of participant IDs
        
        allowNull: false
    },
    hash_id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4, // Automatically generates a UUIDv4
        allowNull: false,
        unique: true
    },
    // Last message reference
    lastMessage: {
        type: DataTypes.JSONB, // Assuming Message IDs are integers; use DataTypes.UUID if you're using UUIDs
        
        allowNull: true
    },
    
}, {
    sequelize,
    modelName: 'Conversation',
    timestamps: true,

    indexes: [
        // Index for efficient querying
        {
            fields: ['participants']
        }
    ]
});

module.exports = Conversation;