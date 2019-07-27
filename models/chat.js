const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  users: [{ type: Schema.ObjectId, ref: "user" }],
  messages: [{ type: Schema.ObjectId, ref: "message" }]
});

module.exports = mongoose.model("chat", ChatSchema);
