const express = require("express")
const app = express()
require("dotenv").config()
const mongoose = require("mongoose")
const errorHandler = require("./middleware/errorHandler")
const userRouter = require("./router/userRouter")

const DB = process.env.DATABASE_URL
mongoose.connect(DB).then(() => {
    console.log("Database connected successfully")
}).catch((err) => {
    console.log("Database connection failed", err.message)
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/v1", userRouter)
app.use(errorHandler)

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})