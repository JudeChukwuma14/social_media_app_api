const otpGenerator = require("otp-generator");
const { OTP_EXPIRY_MINUTES } = require("../config");
const TempUser = require("../model/tempUserModel");
const User = require("../model/userModel");


const generateOTP = async (email, userData = null, type = "register") => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  if (type === "register") {
    if (!userData) {
      throw new Error("User data is required");
    }
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await TempUser.findOneAndUpdate(
      { email },
      { ...userData, otp, otpExpires },
      { upsert: true, new: true }
    );
  } else if (type === "reset") {
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await User.updateOne(
      { email },
      { $set: { otp, otpExpires } },
      { upsert: true, new: true }
    );
  }
  return otp;
};

module.exports = { generateOTP };
