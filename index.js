const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  path = require("path"),
  sequelize = require("./db"),
  cors = require("cors"),
  allowCors = require("./utils/allowCors"),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app);

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Settings for CORS
let allowedOrigins = [process.env.CLIENT_URL, "http://localhost:3000"];
// allowCors(app)
app.use(cors({ origin: allowedOrigins }));

const io = SocketIO.listen(server);

const runSocket = require("./socket");

const User = require("./models/user");
const Chat = require("./models/chat");
const Friend = require("./models/friend");
const Message = require("./models/message");
const Blocked = require("./models/blocked");
const Unread = require("./models/unread");
const Request = require("./models/request");
// const UserChats = require("./models/userChats");
// const UserFriends = require("./models/userFriends");
// const UserBlockeds = require("./models/userBlockeds");
// const UserRequests = require("./models/userRequests");

const chat = require("./api/chat");
const user = require("./api/user");
const request = require("./api/request");

Chat.hasMany(Message);
Message.belongsTo(Chat);
Chat.hasMany(Unread);
Unread.belongsTo(Chat);
User.hasMany(Unread);
Unread.belongsTo(User);
User.belongsToMany(Chat, { through: "UserChat" });
Chat.belongsToMany(User, { through: "UserChat" });
Friend.belongsToMany(User, { through: "UserFriend" });
User.belongsToMany(Friend, { through: "UserFriend" });
Blocked.belongsToMany(User, { through: "UserBlocked" });
User.belongsToMany(Blocked, { through: "UserBlocked" });
Request.belongsToMany(User, { through: "UserRequest" });
User.belongsToMany(Request, { through: "UserRequest" });

// sequelize.sync().catch(err => console.log(err));

app.use("/api/chats", chat);
app.use("/api/users", user);
app.use("/api/requests", request);

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
