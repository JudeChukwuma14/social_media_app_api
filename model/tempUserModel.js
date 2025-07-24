
const mongoose = require("mongoose")
const { OTP_EXPIRY_MINUTES } = require("../config")
const tempUserSchema = new mongoose.Schema({
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
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
        select: false,
        expires: OTP_EXPIRY_MINUTES * 60
    }
}, { timestamps: true })

module.exports = mongoose.model("tempUser", tempUserSchema)