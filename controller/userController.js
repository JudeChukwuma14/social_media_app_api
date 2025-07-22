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
        if (!req.body) {
            const err = new Error("Request body not found");
            err.status = 400;
            throw err;
        }
        const { error } = createUser(req.body);
        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }
        const { username, email, password } = req.body;
        const trimmedEmail = email.trim().toLowerCase();

        const checkUser = await User.findOne({ email: trimmedEmail });

        if (checkUser) {
            const err = new Error("email already exists");
            err.status = 409;
            throw err;
        }

        const checkTempUser = await TempUser.findOne({ email: trimmedEmail });
        if (checkTempUser) {
            await TempUser.deleteOne({ email: trimmedEmail });
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        await TempUser.create({
            username,
            email: trimmedEmail,
            password: hashedPassword,
        });
        const otp = await generateOTP(trimmedEmail);

        const htmlContent = await renderEmailTemplate("otpEmail", {
            username,
            otp,
            expiryMinutes: process.env.OTP_EXPIRY_MINUTES,
        });

        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.MAIL_HOST,
            to: trimmedEmail,
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
        if (!req.body) {
            const err = new Error("Request body not found");
            err.status = 400;
            throw err;
        }
        const { email, otp } = req.body;
        const trimmedEmail = email.trim().toLowerCase();

        const tempUser = await TempUser.findOne({
            email: trimmedEmail,
            otp,
            otpExpires: {
                $gt: Date.now(),
            },
        });
    

        if (!tempUser) {
            await TempUser.deleteOne({ email: trimmedEmail })
            const err = new Error("Invalid or expired OTP");
            err.status = 404;
            throw err;
        }


        const user = await User.create({
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password,
            isVerified: true,
        });

        await TempUser.deleteOne({ email: trimmedEmail });
        const htmlContent = await renderEmailTemplate("welcomeEmail", {
            username: user.username
        });

        console.log("-----", user)
        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.MAIL_HOST,
            to: trimmedEmail,
            subject: "Welcome to Our web-App",
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log("Welcome Email sent successfully");
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
        if (!req.body) {
            const err = new Error("Request body not found");
            err.status = 400;
            throw err;
        }

        const { email } = req.body;
        const trimmedEmail = email.trim().toLowerCase();

        const checkUser = await User.findOne({ email: trimmedEmail });
        if (checkUser) {
            const err = new Error("email already registered and verified");
            err.status = 409;
            throw err;
        }

        const checkTempUser = await TempUser.findOne({ email: trimmedEmail });
        if (!checkTempUser) {
            const err = new Error("No pending verification found for this email");
            err.status = 409;
            throw err;
        }
        const otp = await generateOTP(trimmedEmail);

        const htmlContent = await renderEmailTemplate("otpEmail", {
            username: checkTempUser.username,
            otp,
            expiryMinutes: process.env.OTP_EXPIRY_MINUTES,
        });

        const transporter = await createTransporter();

        const mailOptions = {
            from: process.env.MAIL_HOST,
            to: email,
            subject: "Resend OTP- Verify your account",
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log("New Email sent successfully");

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
    resendOtp,
};
