const express = require("express");
const router = express.Router();
const Op = require("sequelize");
const httpUtils = require("../utils/httpUtils");
const Chat = require("../models/chat"),
  User = require("../models/user"),
  UserChat = require('../models/userChats'),
  Message = require("../models/message");

const getUsers = async names => await User.findAll({
  attributes: ['id', 'name'],
  where: {
    name: names
  }
});

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
    const { users } = req.query;
    let tab = users.split(',')
    let chat = null
    const u = await getUsers(tab)
    if (u.length === 0) {
      return httpUtils.notFound(res, {msg: 'Users not found'})
    }
    const chatsUser1 = await u[0].getChats()
    const chatsUser2 = await u[1].getChats()
    if (chatsUser1 && chatsUser2) {
      let intersection = chatsUser1.find(chatUser1 => chatsUser2.find(chatUser2 => chatUser1.id === chatUser2.id))
      if (intersection) {
        chat = await Chat.findByPk(intersection.id)
      }
    }
    return httpUtils.fetchDataSuccess(res, chat ? { chatId: chat.id } : null);
  } catch (error) {
    return httpUtils.internalError(res);
    // return res.status(500).json(error);
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
    let namesQuery = req.body;

    const users = await getUsers(namesQuery)

    if (users.length === 0) {
      return httpUtils.notFound(res, {msg: 'Users not found'})
    }
    const chat = await Chat.create();
    await chat.setUsers([users[0].id, users[1].id])
    return httpUtils.fetchDataSuccess(res, {chatId: chat.id});
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
