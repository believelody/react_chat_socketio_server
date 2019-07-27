module.exports = {
  mongoURI: `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
  }@react-socket-io-kebdj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
  secret: process.env.SECRET
};
