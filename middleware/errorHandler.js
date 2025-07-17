

const errorHandler = (err, req, res , next) => {
console.error(` This is the error: ${err.message}, Stack: ${err.stack}`)

if(err.name ===  "ValidationError"){
    // mongoose validation error
    return res.status(400).json({
        success: false,
        message: err.message,
        errors: err.errors
    })
}

if(err.code === 11000){
    return res.status(409).json({
        success: false,
        message: "Duplicate key error",
        errors: err.keyValue
    })
}

res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message || "An unexpected error occurred"
})

}
module.exports = errorHandler