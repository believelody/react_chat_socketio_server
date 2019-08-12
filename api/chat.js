const express = require("express");
const router = express.Router();
const Op = require("sequelize");
const httpUtils = require("../utils/httpUtils");
const Chat = require("../models/chat"),
  User = require("../models/user"),
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
    return httpUtils.internalError(res);
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
    let { users } = req.body;
    const chat = await Chat.create();
    await chat.addUsers(users);
    return httpUtils.fetchDataSuccess(res, chat);
  } catch (error) {
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
