const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("./user"),
  Chat = require("./chat");

const Message = sequelize.define("message", {
  text: { type: Sequelize.STRING, allowNull: false }
});

Message.belongTo(User, { as: "author" });
Message.belongTo(Chat);

module.exports = Message;
