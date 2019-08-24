const express = require("express");
const router = express.Router();
const Op = require("sequelize");
const httpUtils = require("../utils/httpUtils");
const Chat = require("../models/chat"),
  User = require("../models/user"),
  UserChat = require('../models/userChats'),
  Message = require("../models/message");

const getUsers = async ids => {
  try {
    return await User.findAll({
      attributes: ['id', 'name'],
      where: {
        id: ids
      }
    })
  } catch (error) {
    console.log("get-users-error: ", error)
  }
}

router.get("/", async (req, res) => {
  try {
    const chats = await Chat.findAll();

    return httpUtils.fetchDataSuccess(res, {chats});
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.get("/:id/searching-chat", async (req, res) => {
  try {
    const { contactId } = req.query;
    const user = await User.findByPk(req.params.id)
    // console.log(user)
    const chat = await user.getChats({
      include: [
        {
          model: User,
          where: { id: contactId }
        }
      ]
    })
    // console.log("search-chat-success", chat)
    return httpUtils.fetchDataSuccess(res, chat.length > 0 ? {id: chat[0].id} : null);
  } catch (error) {
    console.log("searching-chat-error: ", error)
    return httpUtils.internalError(res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const chat = await Chat.findByPk(req.params.id, {
      attributes: ['id'],
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Message
        }
      ]
    });
    return httpUtils.fetchDataSuccess(res, {chat});
  } catch (error) {
    console.log(error)
    return httpUtils.internalError(res);
  }
});

router.post("/", async (req, res) => {
  try {
    let usersQuery = req.body;
    const users = await getUsers(usersQuery)
    if (users.length === 0) {
      return httpUtils.notFound(res, {msg: 'Users not found'})
    }
    const chat = await Chat.create();
    await chat.setUsers(usersQuery)
    return httpUtils.fetchDataSuccess(res, chat ? {id: chat.id} : null);
  } catch (error) {
    console.log("create-chat-error: ", error)
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
