const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    otp: {
        type: String,
        default: null,
        select: false,
    },
    otpExpires: {
        type: Date,
        default: null,
        select: false,
        expires: 900
    },
    isVerifed: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)