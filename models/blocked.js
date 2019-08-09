const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("./user");

const Blocked = sequelize.define("blocked");

module.exports = Blocked;
