const joi = require('joi');

const createUser = (data)=>{
    const schema = joi.object({
        username: joi.string().min(4).max(30).required(),
        email: joi.string().email().required(), 
        password: joi.string().min(6).max(30).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required()
    })
    return schema.validate(data)
}

module.exports = {
    createUser
}