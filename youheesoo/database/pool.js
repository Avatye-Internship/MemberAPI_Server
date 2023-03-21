const mysql = require("mysql2");

// getConnection으로 연결하는 것보다 전에 있던 pool을 이용해서 연결해서 속도가 더 빠름
const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "1234",
  database: "testdb",
});

const db = pool.promise();

module.exports = db;
