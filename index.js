const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  cors = require('cors'),
  path = require("path"),
  uuid = require("uuid"),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app).listen(PORT);
const io = SocketIO(server);

const api = require("./routes/api");

let clients = [];
let chats = [];

const corsOption = {
  origin: 'http://localhost:3000',
  optionSuccessStatus: 200
}
app.use(cors(corsOption))

io.sockets.on("connection", socket => {
  let id = socket.id;
  // console.log("client connected");

  socket.emit("client-emit", id);

  socket.on("user-emit", data => {
    if (!clients.find(client => client.username === data.username))
      clients.push(data);

    io.emit("fetch-users", clients);
  });

  socket.on("new-chat", data => {
    let chat = chats.find(chat => chat.users.filter(user => data.map(d => user.id === d)))

    if (!chat) {
      let users = clients.filter(client => data.map(d => d === client.id))
      chat = { id: uuid(), users, messages: [] }
      chats.push(chat)
    }
    socket.join(chat.id)
    socket.emit("fetch-chat", chat);
    // console.log(chat.messages)
    // socket.to(chat.id).emit('fetch-messages', chat.messages) 
  });

  socket.emit("fetch-chats", chats);

  socket.on("remove-chat", chatId => chats.filter(chat => chat.id !== chatId));

  socket.on("add-user-to-chat", (userId, chatId) => {
    let chat = chats.find(chat => chat.id === chatId);

    if (chat) {
      socket.join(chat.id)
      chat["users"].push(userId);
      socket.to(chat.id).emit("refresh-users-from-chat", chat.users);
    } else {
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("remove-user-from-chat", (userId, chatId) => {
    let chat = chats.find(chat => chat.id === chatId);

    if (chat) {
      chat["users"].filter(user => user.id !== userId);
      socket.emit("refresh-users-from-chat", chat.users);
    } else {
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("new-message", (message) => {
    let chat = chats.find(chat => chat.id === message.chatId);

    if (chat) {
      chat["messages"] = [
        ...chat.messages,
        {
          ...message,
          date: new Date()
        }
      ];

      io.to(chat.id).emit("fetch-chat", chat);
    } else {
      console.log('error')
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("disconnect", () => {
    console.log(clients);
    clients.filter(client => client.id !== id);
    socket.broadcast.emit("user-disconnect", id);
  });
});

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api", api);

//  Server static assets if in production
if (process.env.NODE_ENV === "production") {
  //  Set static folder
  app.use(express.static("../client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}
