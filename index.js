const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  path = require("path"),
  sequelize = require("./db"),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app);
const io = SocketIO(server);

const runSocket = require("./socket");

const User = require("./models/user");
const Chat = require("./models/chat");
const Friend = require("./models/friend");
const Message = require("./models/message");
const Blocked = require("./models/blocked");
const Unreader = require("./models/unreader");
const Request = require("./models/request");

const chat = require("./api/chat");
const user = require("./api/user");

app.use(cors());

Message.hasMany(Unreader);
Chat.hasMany(Message);
User.hasMany(Message);
User.belongsToMany(Chat, { through: "UserChat" });
Chat.belongsToMany(User, { through: "UserChat" });
User.belongsToMany(Friend, { through: "UserFriend", foreignKey: "friendId" });
Friend.belongsToMany(User, { through: "UserFriend", foreignKey: "userId" });
Blocked.belongsToMany(User, { through: "UserBlocked", foreignKey: "userId" });
User.belongsToMany(Blocked, {
  through: "UserBlocked",
  foreignKey: "blockedId"
});
User.belongsToMany(Request, { through: "UserRequest", foreignKey: "requestId" });
Request.belongsToMany(User, { through: "UserRequest", foreignKey: "userId" });

sequelize
  .sync()
  .then(res => {
    // Bodyparser Middleware
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // app.use((req, res, next) => {
    //   req.io = io;
    //   next();
    // });

    runSocket(io);
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

    server.listen(PORT);
  })
  .catch(err => console.log(err));
