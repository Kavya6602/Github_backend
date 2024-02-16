const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Monterox@02',
    database: 'github'
});

connection.connect(function (err) {
    if (err) throw err
    console.log("Database connected")
})

module.exports = connection;