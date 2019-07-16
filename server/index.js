const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  path = require("path"),
  uuid = require("uuid"),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app).listen(PORT);
const io = SocketIO(server);

const api = require("./routes/api");

const clients = [];
const chats = [];

io.sockets.on("connection", socket => {
  let id = socket.id;
  console.log("client connected");

  socket.emit("client-emit", id);

  socket.on("user-emit", data => clients.push(data));

  socket.emit("fetch-users", clients);

  socket.on("new-chat", chat => chats.push({ id: uuid(), ...chat }));

  socket.on("fetch-chat", ({ name }) => chats.find(chat => chat.name === name));

  socket.emit("fetch-chats", chats);

  socket.on("remove-chat", chatId => chats.filter(chat => chat.id !== chatId));

  socket.on("add-user-to-chat", (userId, chatId) => {
    let chat = chats.find(chat => chat.id === chatId);

    if (chat) {
      chat["users"].push(userId);
      socket.emit("refresh-users-from-chat", chat.users);
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

  socket.on("new-message", ({ message, chatId }) => {
    let chat = chats.find(chat => chat.id === chatId);

    if (chat) {
      chat["messages"] = [
        ...chat.messages,
        {
          text: message.text,
          userId: message.userId,
          date: new Date()
        }
      ];

      socket.emit("refresh-messages-from-chat", chat.messages);
    } else {
      socket.emit("error-in-chat", "An error occured");
    }
  });

  socket.on("disconnect", () => {
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
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
