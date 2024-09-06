const User = require('../model/User');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    const refreshToken = cookies.jwt;

    // Check if refreshToken is in the database
    const foundUser = await User.findOne({ where: {refreshToken} });
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });
        return res.sendStatus(204); // No content
    }

    // Delete the refreshToken in the database
    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // secure: true - only serves on HTTPS

    // Emit forceDisconnect event before destroying the session
    req.io.to(foundUser.id.toString()).emit('forceDisconnect');

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed', error: err });
        }
        return res.json({ message: 'Logged out successfully' });
    });
};

module.exports = { handleLogout };
