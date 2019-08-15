const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Unreader = require("../models/unreader");
const Request = require('../models/request')

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

const newRequest = (io, socket) => socket.on('new-request', async ({contactId, userId}) => {
  try {
    console.log('test')
    let requester = null
    const contact = await User.findByPk(contactId);
    if (!contact) return socket.emit('request-confirm', { error: 'User not found' });
    requester = await Request.findOne({ where: { requesterId: userId } })
    if (!requester) {
      requester = await Request.create({ requesterId: userId });
    }
    await contact.addRequest(requester);
    const requests = await contact.getRequests()
    return io.emit('request-confirm', {
      requests,
      from: userId,
      to: contactId,
      msg: `Friend's request sent`
    });
  } catch (error) {
    console.log(error)
    return socket.emit('request-confirm', { error: 'Oups something\'s wrong' });
  }
})

const cancelRequest = (io, socket) => {
  socket.on('cancel-request', async ({ contactId, userId }) => {
    try {
      console.log('yes we can')
      const request = await Request.findOne({ where: { requesterId: userId } });
      if (!request) {
        return socket.emit('request-confirm', { error: 'Request not found' });
      } else {
        const contact = await User.findByPk(contactId, { attributes: ['id', 'name'] })
        if (!contact) {
          return socket.emit('request-confirm', { error: 'User not found' })
        }
        await contact.removeRequest(request)
        await request.destroy();
        const requests = await contact.getRequests()
        return io.emit('request-confirm', { requests, from: userId, to: contactId, msg: "Your request has been deleted" });
      }
    } catch (error) {
      console.log(error)
      return socket.emit('request-confirm', { error: 'Oups something\'s wrong' });
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

    newRequest(io, socket)

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
