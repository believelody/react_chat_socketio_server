const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  path = require("path"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app);
const io = SocketIO(server);

const db = require("./config/keys").mongoURI;

const chat = require("./api/chat");
const user = require("./api/user");

let clients = [];
let chats = [];

app.use(cors());

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => server.listen(PORT))
  .catch(err => console.log(err));

io.sockets.on("connection", socket => {
  let id = socket.id;
  // console.log("client connected");

  // socket.emit("client-emit", id);

  socket.on("user-emit", data => {
    if (!clients.find(client => client.username === data.username))
      clients.push({ ...data, id });
    console.log(clients);
    io.emit("fetch-users", clients);
  });

  socket.on("new-chat", data => {
    let chat = chats.find(chat =>
      chat.users.filter(user => data.map(d => user.id === d))
    );

    if (!chat) {
      let users = clients.filter(client =>
        data.map(d => d === client.username)
      );
      chat = { id: uuid(), users, messages: [] };
      chats.push(chat);
    }
    socket.join(chat.id);
    socket.emit("fetch-chat", chat);
    // console.log(chat.messages)
    // socket.to(chat.id).emit('fetch-messages', chat.messages)
  });

  socket.emit("fetch-chats", chats);

  socket.on("remove-chat", chatId => chats.filter(chat => chat.id !== chatId));

  socket.on("add-user-to-chat", (userId, chatId) => {
    let chat = chats.find(chat => chat.id === chatId);

    if (chat) {
      socket.join(chat.id);
      chat["users"].push(userId);
      socket.to(chat.id).emit("refresh-users-from-chat", chat.users);
    } else {
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("remove-user-from-chat", (username, chatId) => {
    let chat = chats.find(chat => chat.id === chatId);

    if (chat) {
      chat["users"].filter(user => user.username !== username);
      socket.emit("refresh-users-from-chat", chat.users);
    } else {
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("new-message", message => {
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
      console.log("error");
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("typing", () => {
    socket.broadcast.emit("is-typing", true);
  });

  socket.on("stop-typing", () => {
    socket.broadcast.emit("is-typing", false);
  });

  socket.on("disconnect", () => {
    clients.filter(client => {
      if (client.id === id) {
        socket.broadcast.emit("user-disconnected", client.username);
        return null;
      } else return client;
    });
    console.log(clients);
  });
});

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/chats", chat);
app.use("/api/users", user);

//  Server static assets if in production
if (process.env.NODE_ENV === "production") {
  //  Set static folder
  app.use(express.static("index.html"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
  });
}
