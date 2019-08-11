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
let allowedOrigins = ['http://localhost:3000', process.env.CLIENT_URL]
const io = SocketIO.listen(server, {
  log: false,
  agent: false,
  origins: '*:*',
  transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});

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

app.use(cors({ origin: 'https://react-chat-socketio.netlify.com' }));
// Settings for CORS
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.header('Access-Control-Allow-Origin', 'https://react-chat-socketio.netlify.com');

  // Request methods you wish to allow
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', false);

  // Pass to next layer of middleware
  next();
});

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
  .catch(err => console.log(err));

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