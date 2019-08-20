const Sequelize = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("message", {
  authorId: { type: Sequelize.INTEGER, allowFalse: false },
  text: { type: Sequelize.STRING, defaultValue: null },
  read: { type: Sequelize.BOOLEAN, defaultValue: false }
});

module.exports = Message;
