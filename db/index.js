const Sequelize = require("sequelize");

module.exports = new Sequelize(
  `postgres://${process.env.POSTGRE_USER}:${process.env.POSTGRE_PWD}@${
    process.env.POSTGRE_HOST
  }:5432/${process.env.POSTGRE_DB}`
);
