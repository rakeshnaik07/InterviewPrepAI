function createRateLimiter({ windowMs, max, message }) {
    const requests = new Map()

    return (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown'
        const now = Date.now()
        const current = requests.get(key)

        if (!current || now - current.startedAt >= windowMs) {
            requests.set(key, { startedAt: now, count: 1 })
            return next()
        }

        current.count += 1
        if (current.count > max) {
            return res.status(429).json({ message })
        }

        return next()
    }
}

const authRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication requests. Please try again later.'
})

const reportRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many report-generation requests. Please try again later.'
})

const resumePdfRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many resume-generation requests. Please try again later.'
})

module.exports = { authRateLimit, reportRateLimit, resumePdfRateLimit }
