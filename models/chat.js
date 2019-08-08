const Sequelize = require("sequelize");
const sequelize = require("../db");
const Message = require("./message"),
  User = require("./user");

const Chat = sequelize.define("chat");

module.exports = Chat;
