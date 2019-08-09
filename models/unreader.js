const Sequelize = require("sequelize");
const sequelize = require("../db");

const Unreader = sequelize.define("unreader");

module.exports = Unreader;
