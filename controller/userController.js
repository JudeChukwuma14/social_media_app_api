const { createUser } = require("../middleware/joiVaildation");
const { generateOTP } = require("../middleware/otpGenerator");
const { OTP_EXPIRY_MINUTES } = "../config";
const {
    createTransporter,
    renderEmailTemplate,
} = require("../middleware/emailSetup");
const TempUser = require("../model/tempUserModel");
const User = require("../model/userModel");
const bcryptjs = require("bcryptjs");

const registerAccount = async (req, res, next) => {
    try {
        const { error } = createUser(req.body);
        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }
        const { username, email, password } = req.body;

        const checkUser = await User.findOne({ email });
        if (checkUser) {
            const err = new Error("email already exists");
            err.status = 409;
            throw err;
        }

        const checkTempUser = await TempUser.findOne({ email });
        if (checkTempUser) {
            const err = new Error("Email is pending verification, Please verify OTP");
            err.status = 409;
            throw err;
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        const otp = await generateOTP(
            email,
            { username, email, password: hashedPassword },
            "register"
        );

        const htmlContent = await renderEmailTemplate("otpEmail", {
            username,
            otp,
            otpExpiry: OTP_EXPIRY_MINUTES,
        });

        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.MAIL_HOST,
            to: email,
            subject: "Verify your account",
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

        res.status(201).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        if (error.message === "Failed to send OTP email") {
            await TempUser.deleteOne({ email });
        }
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            const err = new Error("Email and OTP are required");
            err.status = 400;
            throw err;
        }

        const tempUser = await TempUser.findOne({ email });
        console.log("tempUser:", tempUser);
        if (!tempUser) {
            const err = new Error("No pending verification found for this email");
            err.status = 404;
            throw err;
        }

        if (tempUser.otp !== otp || tempUser.otpExpires <  Date.now()) {
            const err = new Error("Invalid or expired OTP");
            err.status = 400;
            throw err;
        }
     

        const user = await User.create({
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password,
            isVerified: true,
        });
        
        await TempUser.deleteOne({ email });

        return res.status(200).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            const err = new Error("Email is required");
            err.status = 400;
            throw err;
        }

        const checkUser = await User.findOne({ email });
        if (checkUser) {
            const err = new Error("email already registered and verified");
            err.status = 409;
            throw err;
        }

        const checkTempUser = await TempUser.findOne({ email });
        if (!checkTempUser) {
            const err = new Error("No pending verification found for this email");
            err.status = 409;
            throw err;
        }
        const otp = await generateOTP(email);

        const htmlContent = await renderEmailTemplate("otpEmail", {
            username,
            otp,
            otpExpiry: OTP_EXPIRY_MINUTES,
        });

        const transporter = await createTransporter();

        const mailOptions = {
            from: process.env.MAIL_HOST,
            to: email,
            subject: "Verify your account",
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

        res.status(201).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerAccount,
    verifyOtp,
    resendOtp
};
