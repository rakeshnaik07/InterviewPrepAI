require('dotenv').config()
const { validateEnv } = require('../src/config/env')
const app = require('../src/app')
const connectToDB = require('../src/config/database')

let dbReadyPromise

module.exports = async (req, res) => {
    try {
        validateEnv()
        if (!dbReadyPromise) {
            dbReadyPromise = connectToDB()
        }
        await dbReadyPromise
        return app(req, res)
    } catch (error) {
        return res.status(500).json({
            message: 'Backend is not configured correctly'
        })
    }
}
