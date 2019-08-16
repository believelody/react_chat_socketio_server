const Op = require('sequelize')

const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Unreader = require("../models/unreader");
const Request = require('../models/request')
const Friend = require('../models/friend')

const userNotFoundMessage = { error: 'User not found' }
const requestNotFoundMessage = { error: 'Request not found' }
const friendNotFoundMessage = { error: 'Friend not found' }
const chatNotFoundMessage = { error: 'Chat not found' }
const internalErrorMessage = { error: 'Oups something\'s wrong' }

const sendSocketId = socket => socket.emit("client-emit", socket.id);

const userOnline = (io, socket, users) => {
  socket.on("user-emit", async data => {
    const user = await User.findByPk(data.userId);
    if (user && !user.socketId) {
      await user.update({ socketId: data.socketId });
    }
    io.emit("fetch-users", users);
  });
};

const sendMessage = (io, socket, chats) => {
  socket.on("new-message", async message => {
    let chat = chats.find(chat => chat.id === message.chatId);

    if (chat) {
      let newMsg = await Message.create(message);
      let u = chat.getUsers().map(user => user.id);
      const unreaders = await Unreader.bulkCreate(u);
      await newMsg.setReaders(unreaders);
      await chat.addMessage(newMsg);

      io.to(chat.id).emit("fetch-chat", chat);
    } else {
      console.log("error");
      socket.emit("error-in-chat", "An error occured");
    }
  });
};

const messageRead = socket =>
  socket.on("read", async (message, user) => {
    const unreader = await message.getUnreaders().find(u => u.id === user.id);
    await message.removeReader(unreader);
    await unreader.destroy();
  });

const userOffline = socket => {
  socket.on("disconnect", async () => {
    const user = await User.findOne({ where: { socketId: socket.id } });
    if (user) {
      user.update({ socketId: null });
      socket.broadcast.emit("user-disconnected", user);
    }
  });
};

const goTyping = socket =>
  socket.on("typing", ({ id }) => {
    socket.broadcast.emit("is-typing", {id, status: true});
  });

const stopTyping = socket =>
  socket.on("stop-typing", () => {
    socket.broadcast.emit("is-typing", {id: null, status: false});
  });

const newFriend = (io, socket) => socket.on('new-friend', async ({contactId, userId}) => {
  try {
    let friend = await Friend.findOne({
      include: [
        { model: User, where: {id: [contactId, userId]} }
      ]
    })
    if (friend) {
      return socket.emit('new-friend-confirm', { error: 'You are already friend'})
    }
    else {
      friend = await Friend.create()
      let contact = await User.findByPk(contactId)
      if (!contact) {
        return socket.emit('new-friend-confirm', userNotFoundMessage)
      }
      let user = await User.findByPk(userId)
      if (!user) {
        return socket.emit('new-friend-confirm', userNotFoundMessage)
      }
      let request = await Request.findOne({ where: {requesterId: contactId} })
      if (!request) {
        return socket.emit('new-friend-confirm', requestNotFoundMessage)
      }
      await friend.setUsers([userId, contactId])
      await user.removeRequest(request)
      let friends1 = await user.getFriends()
      let friends2 = await contact.getFriends()
      let requests = await user.getRequests().map(async r => await User.findByPk(r.requesterId))
      console.log(requests)
      return io.emit('new-friend-confirm', {
        from: { id: userId, requests, friends: friends1, msg: 'You are now friends'},
        to: { id: contactId, friends: friends2, msg: `You are now friend with ${user.name}`}
      })
    }
  } catch (error) {
    console.log(error)
    return socket.emit('new-friend-confrm', internalErrorMessage)
  }
})

const deleteFriend = (io, socket) => {
  socket.on('delete-friend', async ({ contactId, userId }) => {
    try {
      const user = await User.findByPk(userId);
      const contact = await User.findByPk(contactId);
      if (!user || !contact) {
        return socket.emit('delete-friend-confirm', userNotFoundMessage);
      } else if (user && contact) {
        const friend = await Friend.findOne({
          include: [
            {
              model: User, 
              where: { id: [userId, contactId]}
            }
          ]
        })
        if (!friend) {
          return socket.emit('delete-friend-confirm', friendNotFoundMessage)
        }
        console.log(friend)
        await user.removeFriend(friend);
        await contact.removeFriend(friend);
        await friend.destroy()
        const friends1 = await user
          .getFriends({
            include: [
              {model: User, attributes: ['id', 'name']}
            ]
          })
        const friends2 = await contact.getFriends({
          include: [
            { model: User, attributes: ['id', 'name'] }
          ]
        })
        return io.emit('delete-friend-confirm', {
          from: { id: userId, friends: friends1, msg: "You unfriend this user"},
          to: {id: contactId, friends: friends2}
        });
      }
    } catch (error) {
      return socket.emit('delete-friend-confirm', internalErrorMessage);
    }
  })
}

const newRequest = (io, socket) => socket.on('new-request', async ({contactId, userId}) => {
  try {
    let requester = null
    const contact = await User.findByPk(contactId);
    if (!contact) return socket.emit('new-request-confirm', userNotFoundMessage);
    requester = await Request.findOne({ where: { requesterId: userId } })
    if (!requester) {
      requester = await Request.create({ requesterId: userId });
    }
    await contact.addRequest(requester);
    const requests = await contact
      .getRequests()
      .map(async r => await User.findByPk(r.requesterId, {
      attributes: ['id', 'name']
    }))
    return io.emit('new-request-confirm', {
      requests,
      from: { id: userId, msg: `Friend's request sent` },
      to: {id: contactId}
    });
  } catch (error) {
    console.log(error)
    return socket.emit('new-request-confirm', internalErrorMessage);
  }
})

const deleteRequest = (io, socket) => {
  socket.on('delete-request', async ({ contactId, userId }) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return socket.emit('delete-request-confirm', userNotFoundMessage);
      } else {
        const request = await Request.findOne({ where: { requesterId: contactId } })
        if (!request) {
          return socket.emit('delete-request-confirm', requestNotFoundMessage)
        }
        await user.removeRequest(request);
        await request.destroy()
        const requests = await user
          .getRequests()
          .map(async r => await User.findByPk(r.requesterId, {
          attributes: ['id', 'name']
        }))
        return io.emit('delete-request-confirm', {
          requests,
          from: { id: userId, msg: "You reject this friend's request" },
          to: {id: contactId}
        });
      }
    } catch (error) {
      console.log(error)
      return socket.emit('delete-request-confirm', internalErrorMessage);
    }
  })
}

const cancelRequest = (io, socket) => {
  socket.on('cancel-request', async ({ contactId, userId }) => {
    try {
      const request = await Request.findOne({ where: { requesterId: userId } });
      if (!request) {
        return socket.emit('cancel-request-confirm', requestNotFoundMessage);
      } else {
        const contact = await User.findByPk(contactId)
        if (!contact) {
          return socket.emit('cancel-request-confirm', userNotFoundMessage)
        }
        await contact.removeRequest(request)
        await request.destroy();
        const requests = await contact
          .getRequests()
          .map(async r => await User.findByPk(r.requesterId, {
          attributes: ['id', 'name']
        }))
        return io.emit('cancel-request-confirm', {
          requests,
          from: { id: userId, msg: "Your request has been deleted" },
          to: {id: contactId}
        });
      }
    } catch (error) {
      console.log(error)
      return socket.emit('cancel-request-confirm', internalErrorMessage);
    }
  })
}

const getUsers = async () => await User.findAll({ attributes: ['id', 'name']});
const getChats = async () => await Chat.findAll();

module.exports = io => {

  io.sockets.on("connection", async socket => {
    const users = await getUsers();
    const chats = await getChats();
    // console.log("client connected");

    sendSocketId(socket);

    userOnline(io, socket, users);

    sendMessage(io, socket, chats);

    goTyping(socket);

    stopTyping(socket);

    messageRead(socket);

    newFriend(io, socket)

    deleteFriend(io, socket)

    newRequest(io, socket)

    deleteRequest(io, socket)

    cancelRequest(io, socket)

    userOffline(socket);

    // socket.on("new-chat", data => {
    //   let chat = chats.find(chat =>
    //     chat.users.filter(user => data.map(d => user.username === d))
    //   );

    //   if (!chat) {
    //     let users = users.filter(client =>
    //       data.map(d => d === client.username)
    //     );
    //     chat = { id: uuid(), users, messages: [] };
    //     chats.push(chat);
    //   }

    //   socket.join(chat.id);
    //   socket.emit("fetch-chat", chat);
    //   // socket.to(chat.id).emit('fetch-messages', chat.messages)
    // });

    // socket.emit("fetch-chats", chats);

    // socket.on("remove-chat", chatId =>
    //   chats.filter(chat => chat.id !== chatId)
    // );

    // socket.on("add-user-to-chat", (userId, chatId) => {
    //   let chat = chats.find(chat => chat.id === chatId);

    //   if (chat) {
    //     socket.join(chat.id);
    //     chat["users"].push(userId);
    //     socket.to(chat.id).emit("refresh-users-from-chat", chat.users);
    //   } else {
    //     socket.emit("error-in-chat", "An error occured");
    //   }
    // });

    // socket.on("remove-user-from-chat", (username, chatId) => {
    //   let chat = chats.find(chat => chat.id === chatId);

    //   if (chat) {
    //     chat["users"].filter(user => user.username !== username);
    //     socket.emit("refresh-users-from-chat", chat.users);
    //   } else {
    //     socket.emit("error-in-chat", "An error occured");
    //   }
    // });
  });
};
