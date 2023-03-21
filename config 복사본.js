module.exports = {
  port: process.env.PORT || 3000,
  base_url: process.env.BASE_URL || "http://localhost:3000",
  db: process.env.DB || {
    host: "127.0.0.1",
    user: "root",
    password: "1234",
    database: "testdb",
  },
};
