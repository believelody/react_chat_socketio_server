const Sequelize = require("sequelize");
const sequelize = require("../db");

const Chat = sequelize.define('chat', {
  text: { type: Sequelize.STRING, allowNull: false }
})

module.exports = Chat