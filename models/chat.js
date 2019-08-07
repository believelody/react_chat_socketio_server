const Sequelize = require("sequelize");
const sequelize = require("../db");
const Message = require("./message"),
  User = require("./User");

const Chat = sequelize.define("chat");

Chat.hasMany(Message);
Chat.belongsToMany(User, { through: "UserChat", foreignKey: "userId" });

module.exports = Chat;
