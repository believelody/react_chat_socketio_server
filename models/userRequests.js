const sequelize = require('../db')

const UserRequests = sequelize.define('userRequests')

module.exports = UserRequests