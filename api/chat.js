const express = require("express");
const router = express.Router();
const Op = require("sequelize");
const httpUtils = require("../utils/httpUtils");
const Chat = require("../models/chat"),
  User = require("../models/user"),
  UserChat = require('../models/userChats'),
  Message = require("../models/message");

router.get("/", async (req, res) => {
  try {
    const chats = await Chat.findAll();

    return httpUtils.fetchDataSuccess(res, chats);
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.get("/searching-chat", async (req, res) => {
  try {
    console.log(req.query);
    const { users } = req.query;
    const chat = await Chat.findOne({
      include: [
        {
          model: User,
          through: {
            attributes: ["id", "name"],
            where: {
              userId: {
                [Op.like]: { [Op.any]: users }
              }
            }
          }
        }
      ]
    });
    // console.log(chat);
    return httpUtils.fetchDataSuccess(res, chat ? { chat } : null);
  } catch (error) {
    // return httpUtils.internalError(res);
    return res.status(500).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const chat = await Chat.findByPk(req.params.id);
    return httpUtils.fetchDataSuccess(res, chat);
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.post("/", async (req, res) => {
  try {
    let userQuery = req.body;
    let chat = null

    const users = await User.findAll({
      where: {
        name: [userQuery[0].name, userQuery[1].name]
      }
    });

    if (users.length === 2) {
      console.log(await users[0].getChats())
      if (users[0].chatId && users[1].chatId && users[0].chatId === users[1].chatId) {
        chat = await Chat.findByPk(users[0].chatId)
      }
      else {
        chat = await Chat.create();
        // users.forEach(async user => await user.addChat(chat.id))
        await chat.setUsers([users[0].id, users[1].id])
      }
    }
    const u =await chat.getUsers()
    return httpUtils.fetchDataSuccess(res, u);
  } catch (error) {
    console.log(error)
    return httpUtils.internalError(res);
  }
});

router.post("/:id/new-user", async (req, res) => {
  try {
    let { newUser } = req.body;
    const chat = await Chat.findByPk(req.params.id);
    if (!chat)
      return httpUtils.notFound(res, { msg: "Sorry this chat doesn't exist" });
    await chat.addUser(newUser);
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id/remove-user", async (req, res) => {
  try {
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const chat = await Chat.findByPk(req.params.id);
    if (!chat)
      return httpUtils.notFound(res, { msg: "Sorry this chat doesn't exist" });
    await chat.destroy();
    return httpUtils.fetchDataSuccess(res, {
      msg: "This chat is successfully deleted"
    });
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

module.exports = router;
