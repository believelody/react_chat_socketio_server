const Sequelize = require("sequelize");
const sequelize = require("../db");

const Unread = sequelize.define("unread", {
    messageId: { type: Sequelize.INTEGER },
    authorId: { type: Sequelize.INTEGER }
});

module.exports = Unread;
