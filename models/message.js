const Sequelize = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("message", {
  text: { type: Sequelize.STRING, allowNull: false },
  unread: { type: Sequelize.BOOLEAN, defaultValue: true }
});

module.exports = Message;
