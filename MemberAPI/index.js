const express = require("express");
const db = require("./database/pool.js");
const router = require("./api/routes/router.js");
const bodyParser = require("body-parser");
// jwt토큰 발급해서 쿠키에 넣어주기 위함
const cookieParser = require("cookie-parser");
const passport = require("passport");
const passportConfig = require("./api/passport/index");

const cookieOption = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};

// 서버 생성
const app = express();
// 미들웨어
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(cookieOption));
app.use(passport.initialize()); // passport 사용
passportConfig();

// 라우터
app.use("/api", router);

app.listen(3000, () => {
  console.log("----server on------");
});
