const Sequelize = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define('user', {
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false, validate: { isEmail: true } },
  password: { type: Sequelize.STRING, allowNull: false },
})

module.exports = User