const Sequelize = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("message", {
  text: { type: Sequelize.STRING, defaultValue: null }
});

module.exports = Message;
