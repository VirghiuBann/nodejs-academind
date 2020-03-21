// get the client
const mysql = require("mysql2");

// create the connection to database
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "academind-node",
    password: "root"
});

module.exports = pool.promise();
