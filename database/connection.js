const mysql = require('mysql')
const { promisify } = require('util')

const pool = mysql.createPool({  
    connectionLimit: 10,
    user: 'root',//'wam', 'root'
    password: '',//'wamserver1234', ''
    database: 'wam',//'wam','wanlocal'
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci'    
})

pool.query = promisify(pool.query)

module.exports = { pool }
