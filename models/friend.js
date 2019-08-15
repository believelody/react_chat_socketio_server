const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("./user");

const Friend = sequelize.define("friend", {
    contactId: { type: Sequelize.INTEGER, allowNull: false }
});

module.exports = Friend;
