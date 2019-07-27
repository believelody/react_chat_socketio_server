const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  chatId: { type: Schema.ObjectId, ref: "chat" },
  author: { type: Schema.ObjectId, ref: "user" },
  text: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("message", MessageSchema);
