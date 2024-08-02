const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

conversationSchema.index({ participants: 1 }); // Index for efficient querying

module.exports = mongoose.model('Conversation', conversationSchema);
