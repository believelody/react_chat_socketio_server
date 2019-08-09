const postgres = require('../db/postgres'), jwt = require("jsonwebtoken")

module.exports = async user => {
    try {
        const payload = { id: user.id, username: user.name };
        let token = await jwt.sign(payload, postgres.secret, {
            algorithm: postgres.algo,
            expiresIn: "7d"
        });
        return token
    } catch (error) {
        throw error
    }
}