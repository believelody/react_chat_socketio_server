const Sequelize = require("sequelize");
const sequelize = require("../db");

const Unreader = sequelize.define("unreader", {
  id: { type: Sequelize.UUID, primaryKey: true }
});

module.exports = Unreader;
