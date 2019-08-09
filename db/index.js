const Sequelize = require("sequelize");
const postgres = require('./postgres')

module.exports = new Sequelize(
    `postgres://${postgres.user}:${postgres.pwd}@${
    postgres.host
    }:5432/${postgres.db}`
);
