const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Unreader = require("../models/unreader");

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
  socket.on("typing", () => {
    socket.broadcast.emit("is-typing", true);
  });

const stopTyping = socket =>
  socket.on("stop-typing", () => {
    socket.broadcast.emit("is-typing", false);
  });

const getUsers = async () => await User.findAll({ attributes: ['id', 'name']});
const getChats = async () => await Chat.findAll();

module.exports = io => {
  io.origins((origin, cb) => {
    if (origin !== process.env.CLIENT_URL || origin !== 'http://localhost:3000') {
      return cb('Not Allowed', false)
    }
    cb(null, true)
  })
  
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
