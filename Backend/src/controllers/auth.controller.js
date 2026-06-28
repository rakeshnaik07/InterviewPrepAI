const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blacklist.model')
const createHttpError = require('../utils/httpError')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}

function normalizeRegisterPayload(body = {}) {
    return {
        username: typeof body.username === 'string' ? body.username.trim() : '',
        email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
        password: typeof body.password === 'string' ? body.password : ''
    }
}

function normalizeLoginPayload(body = {}) {
    return {
        email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
        password: typeof body.password === 'string' ? body.password : ''
    }
}

function validateRegisterPayload({ username, email, password }) {
    if (!username || !email || !password) {
        throw createHttpError(400, "Please provide username, email and password")
    }

    if (username.length < 3 || username.length > 40) {
        throw createHttpError(400, "Username must be between 3 and 40 characters")
    }

    if (!EMAIL_REGEX.test(email)) {
        throw createHttpError(400, "Please provide a valid email")
    }

    if (password.length < 8 || password.length > 128) {
        throw createHttpError(400, "Password must be between 8 and 128 characters")
    }
}

function validateLoginPayload({ email, password }) {
    if (!email || !password) {
        throw createHttpError(400, "Please provide email and password")
    }

    if (!EMAIL_REGEX.test(email)) {
        throw createHttpError(400, "Invalid email or password")
    }
}

function signAuthToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )
}

function toPublicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email
    }
}

/**
 * @name registerUserController
 * @description register a new user
 * @access public
 */
async function registerUserController(req, res) {
    const { username, email, password } = normalizeRegisterPayload(req.body)
    validateRegisterPayload({ username, email, password })

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (isUserAlreadyExists) {
        throw createHttpError(409, "Account already exists")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = signAuthToken(user)

    res.cookie('token', token, getCookieOptions())

    res.status(201).json({
        message: 'User registered successfully',
        user: toPublicUser(user)
    })
}

/**
 * @name loginUserController
 * @description login a user
 * @access public
 */

async function loginUserController(req, res) {
    const { email, password } = normalizeLoginPayload(req.body)
    validateLoginPayload({ email, password })

    const user = await userModel.findOne({ email })

    if (!user) {
        throw createHttpError(400, "Invalid email or password")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw createHttpError(400, "Invalid email or password")
    }

    const token = signAuthToken(user)

    res.cookie('token', token, getCookieOptions())
    res.status(200).json({
        message: "User logged in successfully",
        user: toPublicUser(user)
    })
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.updateOne(
            { token },
            { $setOnInsert: { token } },
            { upsert: true }
        )
    }

    const cookieOptions = getCookieOptions()
    res.clearCookie('token', {
        httpOnly: true,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
    })

    res.status(200).json({
        message: 'User logged out successfully'
    })
}

/**
 * @name getMeController
 * @description get the current looged in user details
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw createHttpError(401, "User no longer exists")
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: toPublicUser(user)
    })
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
