const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("./user");

const Friend = sequelize.define("friend", {
  id: { type: Sequelize.UUID, allowNull: false, primaryKey: true }
});

Friend.belongsToMany(User, { through: "UserFriend", foreignKey: "userId" });

module.exports = Friend;
