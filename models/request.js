const Sequelize = require('sequelize')
const sequelize = require('../db')

const Request = sequelize.define('request', {
    requesterId: { type: Sequelize.INTEGER, allowNull: false }
})

module.exports = Request