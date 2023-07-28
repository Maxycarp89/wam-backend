const mysql = require('mysql')
const { promisify } = require('util')

const pool = mysql.createPool({
    connectionLimit: 10,
    user: 'root',//'wam',
    password: '',//'wamserver1234',
    database: 'wanlocal',//'wam',
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci'
})

pool.query = promisify(pool.query)

module.exports = { pool }
