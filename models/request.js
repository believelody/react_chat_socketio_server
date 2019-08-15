const Sequelize = require('sequelize')
const sequelize = require('../db')

const Request = sequelize.define('request', {
    requesterId: { type: Sequelize.INTEGER }
})

module.exports = Request