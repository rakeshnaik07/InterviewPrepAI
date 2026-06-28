const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, 'username already taken'],
        required : true,
        trim: true,
        minlength: 3,
        maxlength: 40
    },

    email : {
        type: String,
        unique: [true, 'Account already exists with this email'],
        required : true,
        trim: true,
        lowercase: true,
        maxlength: 254
    },

    password : {
        type: String,
        required: true
    }

}, {
    timestamps: true
})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel
