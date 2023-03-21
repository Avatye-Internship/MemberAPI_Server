const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const {
  getUser,
  findByLoginId,
  createUser,
} = require("../service/user.service");
const LocalStrategy = require("passport-local").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ExtractJwt } = require("passport-jwt");
const { findById } = require("../../database/user.query");
const { UnauthorizedError } = require("restify-errors");
require("dotenv").config();

// 로그인
const passportConfig = {
  usernameField: "loginId",
  passwordField: "pwd",
};

const passportVerify = async (username, password, done) => {
  try {
    const loginId = username;
    const pwd = password;

    const user = await findByLoginId(loginId);
    // 해당 아이디가 없다면 에러
    if (!user) {
      return done(null, { code: 404, msg: "존재하지 않는 아이디" });
    }

    // 유저 있으면 해쉬된 비밀번호 비교
    const isSame = await bcrypt.compare(pwd, user.pwd);

    // 비번 같으면 로그인 성공
    if (isSame) {
      return done(null, user);
    } else {
      return done(null, { code: 400, msg: "올바르지 않은 비밀번호" });
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

// 유저
const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // request에서 header의 authorization에서 정보를 가져온다
  secretOrKey: process.env.JWT_SECRET, // 암호 키 입력
};

const UserJWTVerify = async (payload, done) => {
  try {
    // payload의 id값으로 유저의 데이터 조회
    const user = await findById(payload.id);
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user) {
      return done(null, user);
    }
    // 유저 데이터가 없다면 에러 표시
    return done(null, { code: 401, msg: "인증되지 않은 회원" });
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

const AdminJWTVerify = async (payload, done) => {
  try {
    // payload의 id값으로 유저의 데이터 조회
    const user = await findById(payload.id);
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user) {
      // 관리자만 접근 가능
      if (user.roleType == "ADMIN") {
        return done(null, user);
      } else {
        return done(null, {
          code: 403,
          msg: "접근 권한 없음",
        });
      }
    } else {
      // 유저 데이터가 없는 경우
      return done(null, {
        code: 401,
        msg: "인증되지 않은 회원",
      });
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

// 카카오
const KakaoConfig = {
  clientID: "7d5afad9f86197e00f3cbfb1c227e14c",
  callbackURL: process.env.KAKAO_CALLBACK_URL,
};

const KakaoVerify = async (accessToken, refreshToken, profile, done) => {
  try {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    // 가입 이력 조사
    const exUser = await findByLoginId(profileJson.id, "KAKAO");

    // 이미 있는 회원
    if (exUser) {
      done(null, exUser);
    } else {
      // 새로 가입
      const newUser = await createUser({
        email:
          kakao_account.has_email && !kakao_account.email_needs_agreement
            ? kakao_account.email
            : null,
        userName: kakao_account.profile.nickname,
        loginId: profileJson.id,
        providerType: "KAKAO",
      });
      done(null, newUser);
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

module.exports = () => {
  passport.use("local", new LocalStrategy(passportConfig, passportVerify));
  passport.use("jwt-user", new JWTStrategy(JWTConfig, UserJWTVerify));
  passport.use("jwt-admin", new JWTStrategy(JWTConfig, AdminJWTVerify));
  passport.use("kakao", new KakaoStrategy(KakaoConfig, KakaoVerify));
};
