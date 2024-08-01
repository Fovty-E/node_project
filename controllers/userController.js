const User = require('../model/User')
const jwt = require('jsonwebtoken')

const fetchDashboard = async (req, res) => {
    const accessToken = localStorage.getItem('accessToken')
    const userInfo = accessToken.UserInfo
    if(!userInfo) res.sendStatus(400) // Bad request
    console.log(userInfo)
}