const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("./user");

const Friend = sequelize.define("friend");

module.exports = Friend;
