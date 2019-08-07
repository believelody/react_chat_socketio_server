const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("./user");

const Blocked = sequelize.define("blocked", {
  id: { type: Sequelize.UUID, allowNull: false, primaryKey: true }
});

Blocked.belongsToMany(User, { through: "UserBlocked", foreignKey: "userId" });

module.exports = Blocked;
