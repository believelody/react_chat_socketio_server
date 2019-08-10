const postgres = require('../db/postgres'), jwt = require("jsonwebtoken")

module.exports = async user => {
    try {
        const payload = { id: user.id, username: user.name };
        let token = await jwt.sign(payload, postgres.secret, {
            expiresIn: "7d"
        });
        console.log(token)
        return token
    } catch (error) {
        console.log(token)
        throw error
    }
}