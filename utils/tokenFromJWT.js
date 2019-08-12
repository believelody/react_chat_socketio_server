const postgres = require("../db/postgres"),
  jwt = require("jsonwebtoken");

module.exports = async user => {
  try {
    const payload = { id: user.id, name: user.name };
    let token = await jwt.sign(payload, postgres.secret, {
      expiresIn: "7d"
    });
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
