const keyProd = require('./keyProd'), keyDev = require('./keyDev')
module.exports = process.env.NODE_ENV === 'production' ? keyProd : keyDev