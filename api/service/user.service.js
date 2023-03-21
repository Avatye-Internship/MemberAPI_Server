const jwt = require("jsonwebtoken");
const {
  findAll,
  findById,
  updateUser,
  findByLoginId,
  findByEmail,
  findBySocialId,
  createSocialUser,
  createLocalUser,
  deleteUser,
  updateUserGrade,
  findGradeById,
  updateGrade,
  updatePwd,
} = require("../../database/user.query");
const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = {
  // 유저 목록 조회
  getUsers: async () => {
    try {
      let data = await findAll();
      return data;
    } catch (err) {
      console.log(err);
      throw Error(err);
    }
  },

  // 유저 id로 조회
  getUser: async (id) => {
    try {
      let data = await findById(id);
      return data;
    } catch (err) {
      throw Error(err);
    }
  },

  // 유저 정보 수정
  updateUser: async (id, userReq) => {
    try {
      const newUser = await updateUser(id, userReq);
      return newUser;
    } catch (err) {
      throw Error(err);
    }
  },

  // 유저 등급 수정
  updateUserGrade: async (id, grade) => {
    try {
      const newUser = await updateUserGrade(id, grade);
      return newUser;
    } catch (error) {}
  },

  // 등급 내용 수정
  updateUserGrade: async (id, grade) => {
    try {
      const newGrade = await updateGrade(id, grade);
      return newGrade;
    } catch (error) {}
  },

  getGrade: async (id) => {
    try {
      const grade = await findGradeById(id);
      return grade;
    } catch (error) {}
  },

  // 유저 저장
  createUser: async (userReq) => {
    try {
      let insertId;
      // 로컬 로그인인 경우 비밀번호 암호화해서 저장
      if (userReq.pwd != null) {
        const hashed = await bcrypt.hash(userReq.pwd, 10);
        insertId = await createLocalUser(userReq, hashed);
      } else {
        // 소셜로그인인 경우 비밀번호 제외하고 저장
        insertId = await createSocialUser(userReq);
      }
      return insertId;
    } catch (err) {
      throw Error(err);
    }
  },

  // login id 있는지 확인
  checkId: async (loginId) => {
    try {
      const data = await findByLoginId(loginId);
      return data;
    } catch (error) {
      throw Error(error);
    }
  },

  // email 있는지 확인
  checkEmail: async (email) => {
    try {
      const data = await findByEmail(email);
      return data;
    } catch (error) {
      throw Error(error);
    }
  },

  // 유저 삭제
  deleteUser: async (id) => {
    try {
      const deleted = await deleteUser(id);
      return deleted;
    } catch (err) {
      throw Error(err);
    }
  },

  // 비밀번호 변경
  updatePwd: async (id, pwd) => {
    try {
      const hashed = await bcrypt.hash(pwd, 10);
      const updated = await updatePwd(id, hashed);
      return updated;
    } catch (err) {
      throw Error(err);
    }
  },

  // 로그인 아이디로 찾기
  findByLoginId: async (loginId, providerType) => {
    try {
      let data;
      if (providerType != null) {
        data = await findBySocialId(loginId, providerType);
      } else {
        data = await findByLoginId(loginId);
      }
      return data;
    } catch (err) {
      throw Error(err);
    }
  },

  // 토큰 만들기
  generateJWTToken: async (id, roleType) => {
    const token = jwt.sign({ id, roleType }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    return token;
  },
};
