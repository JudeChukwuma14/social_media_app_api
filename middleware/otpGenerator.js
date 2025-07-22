const otpGenerator = require("otp-generator");
const TempUser = require("../model/tempUserModel");
const User = require("../model/userModel");


const generateOTP = async (email) => {
  const trimmedEmail = email.trim().toLowerCase()
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const user = await User.findOne({email: trimmedEmail});
  if(user){
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000)
    await User.updateOne(
      {email: trimmedEmail},
      {$set: {otp, otpExpires}}
    )
  }else{
    const tempUser = await TempUser.findOne({email: trimmedEmail});
    if(!tempUser){
      throw new Error("No pending registration found for this email");
    }
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000)
    await TempUser.updateOne(
      {email: trimmedEmail},
      {$set: {otp, otpExpires}}
    );
  }
  return otp;
};

module.exports = { generateOTP };
