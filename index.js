const http = require("http"),
  express = require("express"),
  SocketIO = require("socket.io"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  path = require("path"),
  uuid = require("uuid"),
  sequelize = require("./db"),
  app = express();
const PORT = process.env.PORT || 5000;
const server = http.Server(app);
const io = SocketIO(server);

const runSocket = require("./socket");

const chat = require("./api/chat");
const user = require("./api/user");

app.use(cors());

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
