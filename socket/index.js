const Op = require('sequelize')

const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Unread = require("../models/unread");
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

const sendMessage = (io, socket) => {
  socket.on("new-message", async ({chatId, authorId, text}) => {
    try {
      let chat = await Chat.findByPk(chatId, {
        attributes: ['id'],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
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

      if (chat) {
        let newMsg = await Message.create({text, authorId, chatId: chat.id});
        let unread = await Unread.create({ messageId: newMsg.id, authorId, chatId: chat.id })
        await chat.addUnread(unread)
        await chat.addMessage(newMsg)
        chat.users.filter(u => u.id !== authorId).map(async u => await u.addUnread(unread))
        let users = await chat.getUsers({
          attributes: ['id', 'email', 'name']
        }).map(async u => {
          let chats = await Chat.findAll({
            order: [
              [{ model: Message }, 'id', 'DESC']
            ],
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'email'],
                where: { id: u.id }
              },
              {
                model: Message,
                order: [
                  ['id', 'DESC']
                ]
              },
              { model: Unread }
            ]
          })
          return {id: u.id, name: u.name, email: u.email, chats}
        })
        const messages = await chat.getMessages()
        let unreads = await chat.getUnreads()
        io.emit('count-unread-chat', { 
          sender: users.find(u => u.id === authorId), 
          unreads, 
          chatId: chat.id, 
          receivers: users.filter(u => u.id !== authorId)
        })
        io.emit('count-unread-message', { 
          message: newMsg, 
          sender: users.find(u => u.id === authorId),
          unreads,
          chatId: chat.id,
          receivers: users.filter(u => u.id !== authorId)
        })
        // return io.emit("fetch-chat", {chat});
        return io.emit("fetch-messages", { messages, chatId: chat.id });
      } else {
        socket.emit('error-fetch-messages', chatNotFoundMessage)
      }
    } catch (error) {
      console.log(error);
      socket.emit("error-fetch-messages", internalErrorMessage)    
    }
  });
};

const messageRead = (io, socket) => socket.on("message-read", async ({ userId, chatId,  }) => {
  try {
    const user = await User.findByPk(userId)

    if (user) {
      let chat = await Chat.findByPk(chatId, {
        include: [
          {
            model: User,
            attributes: ['id', 'name']
          },
          {
            model: Unread
          }
        ]
      })

      let unreads = await Unread.findAll({
        include: [
          {
            model: User,
            where: { id: user.id },
            attributes: ['id']
          },
          {
            model: Chat,
            where: { id: chat.id },
            attributes: ['id']
          }
        ]
      })
      // console.log(unreads)
      const unreadUsers = unreads.map(unread => unread.user)
      // console.log(unreadUsers)
      if (unreads.length > 0)
        await user.removeUnreads(unreads)
      if (unreadUsers.length > 0)
        await chat.removeUnreads(unreads)
      socket.emit('count-read-chat', { userId, chat })
      socket.emit('count-read-message', {userId, chat})
      // return io.emit("fetch-message", {chat})
    }
  } catch (error) {
    console.log(error)
    socket.emit('error-message-read', internalErrorMessage)
  }
});

const userOffline = socket => {
  socket.on("disconnect", async () => {
    try {
      const user = await User.findOne({ where: { socketId: socket.id } });
      if (user) {
        user.update({ socketId: null });
        socket.broadcast.emit("user-disconnected", user);
      }
    } catch (error) {
      console.log(error)
      socket.emit('error-disconnet', internalErrorMessage)
    }
  });
};

const goTyping = socket => socket.on("typing", ({ id }) => {
  socket.broadcast.emit("is-typing", {id, status: true});
});

const stopTyping = socket => socket.on("stop-typing", () => {
  socket.broadcast.emit("is-typing", {id: null, status: false});
});

const newFriend = (io, socket) => socket.on('new-friend', async ({ contactId, userId }) => {
  try {
    let user = await User.findByPk(userId)
    let friend = await user.getFriends({
      include: [
        {
          model: User,
          where: { id: contactId }
        }
      ]
    })
    // console.log('fetch-friend: ', friend)
    // return io.emit('new-friend-confirm', null)
    if (friend.length === 0) {
      friend = await Friend.create()
      let contact = await User.findByPk(contactId)
      if (!contact) {
        return socket.emit('new-friend-confirm', userNotFoundMessage)
      }
      let user = await User.findByPk(userId)
      if (!user) {
        return socket.emit('new-friend-confirm', userNotFoundMessage)
      }
      let request = await Request.findOne({ where: { requesterId: contactId } })
      if (!request) {
        return socket.emit('new-friend-confirm', requestNotFoundMessage)
      }
      await friend.setUsers([userId, contactId])
      await user.removeRequest(request)
      let friends1 = await getFriends(user)
  
      let friends2 = await getFriends(contact)
  
      let requests = await user.getRequests().map(async r => await User.findByPk(r.requesterId))
      console.log(requests)
      return io.emit('new-friend-confirm', {
        from: { id: userId, requests, friends: friends1, msg: 'You are now friends' },
        to: { id: contactId, friends: friends2, msg: `You are now friend with ${user.name}` }
      })
    }
    else {
      return socket.emit('new-friend-confirm', { error: 'You are already friend' })
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

const purgeChat = socket => socket.on('purge-chat', async () => {
  try {
    const emptyChats = await Chat.findAll({
      include: [
        {
          model: Message
        },
        {
          model: User,
          attributes: ['id']
        },
        {
          model: Unread
        }
      ]
    })
    .filter(c => c.messages.length === 0 && c.unreads.length === 0)
    .map(async c => {
      c.users.map(async u => await u.removeChat(c.id))
      await c.destroy()
    })
    console.log("empty chats: ", emptyChats)
  } catch (error) {
    console.log(error)
  }
})

const checkFriend = socket => {
  socket.on('check-friend', async ({contactId, userId}) => {
    try {
      let user = await User.findByPk(userId)
      let friends = await user.getFriends({
        include: [
          {
            model: User,
            where: { id: contactId },
            attributes: ['id']
          }
        ]
      })
      // console.log("fetch-friend: ",friend)
      return socket.emit('check-friend-response', friends.length === 1 ? { id: contactId } : null)
    } catch (error) {
      // console.log(error)
      return socket.emit('check-friend-response', internalErrorMessage)
    }
  })
}

const checkRequest = socket => {
  socket.on('check-request', async ({ contactId, userId }) => {
    try {
      const request = await Request.findOne({
        where: {
          requesterId: contactId
        },
        include: [
          {
            model: User,
            where: {
              id: userId
            }
          }
        ]
      })
      return socket.emit('check-request-response', request ? { id: contactId } : null)
    } catch (error) {
      return socket.emit('check-request-response', internalErrorMessage)
    }
  })
}

const checkIsBlocked = socket => {}

const checkHasBlocked = socket => {}

const getUsers = async () => await User.findAll({ attributes: ['id', 'name']});
const getChats = async () => await Chat.findAll();
const getFriends = async user => await user.getFriends({
  include: [
    { model: User, attributes: ['id', 'name'] }
  ]
}).map(f => f.users.find(u => u.id !== user.id))

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

    messageRead(io, socket);

    newFriend(io, socket)

    deleteFriend(io, socket)

    newRequest(io, socket)

    deleteRequest(io, socket)

    cancelRequest(io, socket)

    purgeChat(socket)

    userOffline(socket);

    checkFriend(socket)

    checkRequest(socket)

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
