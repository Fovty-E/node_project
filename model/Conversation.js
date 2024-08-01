const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
