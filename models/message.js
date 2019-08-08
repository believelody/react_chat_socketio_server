const Sequelize = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("message", {
  text: { type: Sequelize.STRING, allowNull: false }
});

module.exports = Message;
