const express = require('express')
const cors = require('cors')
const app = express()
const cookieParser = require('cookie-parser')
const { getFrontendOrigins } = require('./config/env')
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware')
const { authRateLimit } = require('./middlewares/rate-limit.middleware')

app.set('trust proxy', 1)
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

const allowedOrigins = getFrontendOrigins()

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
}))

app.get('/api/health', (req, res) => {
    return res.status(200).json({
        ok: true,
        service: 'backend',
        time: new Date().toISOString()
    })
})

//require all the routes here
const authRouter = require('./routes/auth.routes')
const interviewRouter = require("./routes/interview.routes")

// using all the routes here
app.use('/api/auth', authRateLimit, authRouter)
app.use('/api/interview', interviewRouter)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
