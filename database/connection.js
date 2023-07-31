const mysql = require('mysql')
const { promisify } = require('util')

const pool = mysql.createPool({  
    connectionLimit: 10,
    user: 'wam',//'wam', 'root'
    password: 'wamserver1234',//'wamserver1234', ''
    database: 'wam',//'wam','wanlocal'
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci' ,
    host:'45.227.163.223'   //127.0.0.1
})

pool.query = promisify(pool.query)

module.exports = { pool }
