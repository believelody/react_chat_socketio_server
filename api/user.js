const express = require("express"),
  bcrypt = require("bcryptjs"),
  Sequelize = require("sequelize");
const User = require("../models/user"),
  Chat = require("../models/chat"),
  Unread = require("../models/unread"),
  Friend = require("../models/friend"),
  Blocked = require("../models/blocked"),
  Message = require("../models/message"),
  Request = require('../models/request');
const httpUtils = require("../utils/httpUtils"),
  tokenFromJWT = require("../utils/tokenFromJWT");
const router = express.Router();
const Op = Sequelize.Op;

let userNotFoundMessage = { msg: "User not Found" };

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      includes: [
        {
          model: Request
        }
      ]
    });

    return httpUtils.fetchDataSuccess(res, {users});
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    else return httpUtils.fetchDataSuccess(res, user);
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.get("/:id/chat-list", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    const chats = await user.getChats({
      order: [
        [{model: Message}, 'createdAt', 'DESC']
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Message,
          order: [
            ['id', 'DESC']
          ]
        },
        {
          model: Unread
        }
      ]
    });
    // console.log("fetch-chat-list", chats)
    return httpUtils.fetchDataSuccess(res, {chats: chats.filter(c => c.messages.length > 0)});
  } catch (error) {
    console.log(error)
  }
});

router.get("/:id/friend-list", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    const friends = await user.getFriends({ 
      include: [
        {model: User, attributes: ['id', 'name']}
      ] 
    }).map(f => f.users.find(u => u.id !== user.id))
    return httpUtils.fetchDataSuccess(res, {friends});
  } catch (error) {
    console.log(error)
    return httpUtils.internalError(res);
  }
});

router.get("/:id/blocked-list", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    const blocked = await user.getBlockeds();
    return httpUtils.fetchDataSuccess(res, {blocked});
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.get("/:id/request-list", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    }
    const requestFriends = await user
      .getRequests()
      .map(async r => await User.findByPk(r.requesterId, { attributes: ['id', 'name']}));
    return httpUtils.fetchDataSuccess(res, { requests: requestFriends});
  } catch (error) {
    console.log(error)
    return httpUtils.internalError(res);
  }
});

router.get("/:id/search-user", async (req, res) => {
  try {
    let { user } = req.query;    
    const users = await User.findAll({
      include: [
        {
          model: Request
        }
      ],
      attributes: ["id", "name", 'email'],
      where: {
        name: { [Op.substring]: user },
        id: { [Op.not]: req.params.id }
      }
    });
    return httpUtils.fetchDataSuccess(res, {users});
  } catch (error) {
    console.log(error);
    return httpUtils.internalError(res);
  }
});

router.get("/:id/search-friend", async (req, res) => {
  try {
    let { friendQuery } = req.query;
    const user = await User.findbyPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    const friends = await user.getFriends();
    return httpUtils.fetchDataSuccess(
      res,
      {friends: friends.filter(friend => friend.dataValues.name.contains(friendQuery))}
    );
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.post("/login", async (req, res) => {
  try {
    let errors = {};
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    console.log(user)
    if (!user) {
      errors.email = `Invalid email`;
      return httpUtils.errorHandled(res, errors);
    } else {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.password = `Incorrect password`;
        return httpUtils.errorHandled(res, errors);
      } else {
        let token = await tokenFromJWT(user);
        return httpUtils.fetchDataSuccess(res, { token });
      }
    }
  } catch (error) {
    console.log(error);
    return httpUtils.internalError(res);
  }
});

router.post("/register", async (req, res) => {
  try {
    let errors = {};
    const { name, email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      errors.email = "This email already exists";
      return httpUtils.errorHandled(res, errors);
    } else {
      if (password.length < 4) {
        errors.password = "Password must have 4 characters minimum";
        return httpUtils.errorHandled(res, errors);
      }
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);
      const newUser = {
        name,
        email,
        password: hash,
        role: email === process.env.ADMIN_EMAIL ? "admin" : "public"
      };
      let u = await User.create(newUser);
      let token = await tokenFromJWT(u);
      return httpUtils.fetchDataSuccess(res, { token });
    }
  } catch (error) {
    console.log(error);
    return httpUtils.internalError(res);
  }
});

router.post("/:id/new-friend", async (req, res) => {
  try {
    const { newFriend } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    const friend = await Friend.create(newFriend);
    await user.addFriend(friend);
    return httpUtils.fetchDataSuccess(res, {
      msg: `You are now friend with ${friend.name}`
    });
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.post("/:id/new-blocked", async (req, res) => {
  try {
    const { friend } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, userNotFoundMessage);
    const blocked = await Blocked.create(friend);
    await user.addBlocked(blocked);
    return httpUtils.fetchDataSuccess(res, {
      msg: `You have blocked ${blocked.name}`
    });
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.post("/:id/new-request", async (req, res) => {
  try {
    let requester = null
    const {contactId} = req.body;
    const contact = await User.findByPk(contactId);
    if (!contact) return httpUtils.notFound(res, userNotFoundMessage);
    requester = await Request.findOne({ where: {requesterId: req.params.id }})
    if (!requester) {
      requester = await Request.create({ requesterId: req.params.id });
    }
    await contact.addRequest(requester);
    const requests = await contact.getRequests()
    return httpUtils.fetchDataSuccess(res, {
      requests,
      msg: `Friend's request sent`
    });
  } catch (error) {
    console.log(error)
    return httpUtils.internalError(res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    } else {
      await user.update(req.body.data);
      return httpUtils.fetchDataSuccess(res, {
        msg: "Information successfully updated"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete('/drop-friend', async (req, res) => {
  try {
    // const users = await User.findAll()
    // users.map(async u => await u.removeFriends())
    await Friend.drop()
    return httpUtils.fetchDataSuccess(res, { msg: 'Table successfully deleted' })
  } catch (error) {
    console.error(error)
    // return httpUtils.internalError(res)
    return res.status(500).json(error)
  }
})

router.delete("/:id/delete-chat", async (req, res) => {
  try {
    const { chat } = req.body;
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    } else {
      await user.deleteChat(chat);
      return httpUtils.fetchDataSuccess(res, {
        msg: "This chat is successfully deleted"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id/delete-friend", async (req, res) => {
  try {
    const { friend } = req.body;
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    } else {
      await user.deleteFriend(friend);
      return httpUtils.fetchDataSuccess(res, {
        msg: "Your contact has been deleted"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id/delete-request", async (req, res) => {
  try {
    const { contactId } = req.query;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    } else {
      const request = await Request.findOne({where: {requesterId: contactId}})
      if (!request) {
        return httpUtils.notFound(res, {msg: 'Request not found'})
      }
      await user.removeRequest(request);
      await request.destroy()
      const requests = await user.getRequests()
      return httpUtils.fetchDataSuccess(res, {
        requests,
        msg: "You reject this friend's request"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id/cancel-request", async (req, res) => {
  try {
    const request = await Request.findOne({ where: {requesterId: req.params.id} });
    if (!request) {
      return httpUtils.notFound(res, {msg: 'Request not found'});
    } else {
      const contact = await User.findByPk(req.query.contactId, { attributes: ['id', 'name'] })
      if (!contact) {
        return httpUtils.notFound(res, userNotFoundMessage)
      }
      await contact.removeRequest(request)
      await request.destroy();
      const requests = await contact.getRequests()
      return httpUtils.fetchDataSuccess(res, { requests, msg: "Your request has been deleted" });
    }
  } catch (error) {
    console.log(error)
    return httpUtils.internalError(res);
  }
});

router.delete("/:id/remove-blocked", async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    } else {
      await user.deleteBlocked(blocked);
      return httpUtils.fetchDataSuccess(res, {
        msg: `Your contact has been removed from blocked list`
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, userNotFoundMessage);
    } else {
      await user.destroy();
      return httpUtils.fetchDataSuccess(res, {
        msg: "Your account has been deleted"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});


router.delete('/drop-request', async (req, res) => {
  try {
    await Request.drop()
    return httpUtils.fetchDataSuccess(res, { msg: 'Table successfully deleted' })
  } catch (error) {
    console.error(error)
    return httpUtils.internalError(res)
  }
})

module.exports = router;
