const mysql = require("mysql2");

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'library_app'
}).promise();

const result = await pool.query("SELECT * FROM users");
console.log(result);