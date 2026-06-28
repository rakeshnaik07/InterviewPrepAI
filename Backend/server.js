require('dotenv').config()
const { validateEnv } = require('./src/config/env')
const app = require('./src/app')
const connectToDB = require('./src/config/database')
const PORT = process.env.PORT || 3000

async function startServer() {
    try {
        validateEnv()
        await connectToDB()

        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error.message)
        process.exit(1)
    }
}

startServer()
