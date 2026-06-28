const mongoose = require('mongoose')

let isConnected = false

async function connectToDB() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured')
    }

    try{
        await mongoose.connect(process.env.MONGO_URI)
        isConnected = true
        console.log('Connected to database')
        return mongoose.connection
    } catch(err){
        console.log(err);
        throw err
    }
}

module.exports = connectToDB
