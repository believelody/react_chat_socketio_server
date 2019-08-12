const dotenv = require('dotenv')
dotenv.config()
module.exports =  {
    host: process.env.POSTGRE_HOST,
    pwd: process.env.POSTGRE_PWD,
    user: process.env.POSTGRE_USER,
    db: process.env.POSTGRE_DB,
    secret: process.env.SECRET,
    algo: process.env.JWT_ALGO
}