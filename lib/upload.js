const multer = require("multer")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("./cloudinary");



const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "social_media_app",
        allowed_formats: ["jpg", "png", "gif"],
        public_id: (req, file) => {
            const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
            return `${uniqueName}-${file.originalname.split(".")[0]}`
        }
    }
})


const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpg", "image/png", "image/gif"]
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("only jpg, png, gif image are allowed"), false)
    }
}

const upload = {
    single: multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    }).single("profileImage"),
    array: multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, files:5 
        }
    }).array("images")
}

module.exports = upload