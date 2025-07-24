const joi = require("joi");

const createUser = (data) => {
  const schema = joi.object({
    username: joi.string().min(4).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(30).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  });
  return schema.validate(data);
};
const forgetPass = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
  });
  return schema.validate(data);
};

const resetPass = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
    password: joi.string().min(6).max(30).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  });
  return schema.validate(data);
};

const login = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).max(30).required(),
  });
  return schema.validate(data);
};
const logout = (data) => {
  const schema = joi.object({
    authorization: joi
      .string()
      .pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
      .required(),
  });
  return schema.validate(data);
};

module.exports = {
  createUser,
  forgetPass,
  resetPass,
  login,
  logout
};
