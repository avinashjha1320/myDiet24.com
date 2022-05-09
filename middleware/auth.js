const jwt = require('jsonwebtoken')
const Owner = require('../models/owner')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies['session-token']
        const decoded = jwt.verify(token, 'spiderman')
        const owner = await Owner.findOne({ _id: decoded._id })

        if (!owner) {
            res.status(401).send("<h1>Unauthorized, please sign in first..</h1>")
        }
        req.token = token
        req.owner = owner
        next()
    } catch (error) {
        res.status(401).send("<h1>Unauthorized, please sign in first..</h1>")
    }
}

// this auth is only for public routes
const virtualAuth = async (req, res, next) => {
    try {
        (req.cookies['session-token']) ? req.isAuthorized = true : req.isAuthorized = false
        next();
    } catch (error) {

    }
}

module.exports = {
    auth,
    virtualAuth
}