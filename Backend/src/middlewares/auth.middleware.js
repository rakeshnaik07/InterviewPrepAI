const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blacklist.model')
const createHttpError = require('../utils/httpError')

function getTokenFromRequest(req) {
    const cookieToken = req.cookies?.token
    const authHeader = req.get('authorization') || ''

    if (cookieToken) {
        return cookieToken
    }

    if (authHeader.toLowerCase().startsWith('bearer ')) {
        return authHeader.slice(7).trim()
    }

    return ''
}

async function authUser(req, res, next) {
    const token = getTokenFromRequest(req)
    if (!token) {
        throw createHttpError(401, "Token not provided")
    }

    try {
        const isTokenBlackListed = await tokenBlacklistModel.exists({ token })

        if (isTokenBlackListed) {
            throw createHttpError(401, "Token is invalid")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()

    } catch (err) {
        if (err.status) {
            throw err
        }
        throw createHttpError(401, "Invalid token")
    }
}

module.exports = { authUser }
