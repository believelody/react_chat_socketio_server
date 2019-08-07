const Sequelize = require("sequelize");
const sequelize = require("../db");
const Chat = require("./chat");

const User = sequelize.define("user", {
  id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: { type: Sequelize.STRING, allowNull: false },
  socketId: { type: Sequelize.STRING },
  role: { type: Sequelize.STRING, defaultValue: "public" }
});

User.belongsToMany(Chat, { through: "UserChat", foreignKey: "chatId" });

module.exports = User;
