const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", reactionSchema);
