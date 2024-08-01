const User = require('../model/User')
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');

const fetchDashboard = async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken }).exec()
    if(!foundUser) res.sendStatus(400) // Bad request
    const { username, email } = foundUser
    res.json({username, email})
}

const displayChatUsers = async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken }).exec()
    // Find other users (excluding the current user)
    const friends = await User.find({username: { $ne: foundUser.username }}, '_id username email').exec();
    res.json(friends)
}

const fetchConversation = async (req, res) => {
    const userId = req.session.userId;
    const conversation = await Conversation.findById(userId);
}
module.exports = { fetchDashboard, displayChatUsers, fetchConversation }