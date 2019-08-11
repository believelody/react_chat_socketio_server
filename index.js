const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  path = require("path"),
  sequelize = require("./db"),
  allowCors = require('./utils/allowCors'),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app);

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Settings for CORS
// allowCors(app)
let allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000']
/* app.use(function (req, res, next) {
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});    */
app.use(cors({ origin: allowedOrigins }))

const io = SocketIO.listen(server);

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

app.use("/api/chats", chat);
app.use("/api/users", user);

runSocket(io);

//  Server static assets if in production
if (process.env.NODE_ENV === "production") {
  //  Set static folder
  app.use(express.static("index.html"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
  });
}

server.listen(PORT);