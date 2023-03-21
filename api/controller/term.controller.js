const ResponseDto = require("../model/ResponseDto");
const termService = require("../service/term.service");
const userService = require("../service/user.service");
const { validateReq } = require("./user.controller");

module.exports = {
  // 약관 전체 조회
  getTerms: async (req, res, next) => {
    try {
      const terms = await termService.getTerms();
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 조회 성공", terms));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
  // 약관별 조회
  getTerm: async (req, res, next) => {
    try {
      const { name } = req.params;
      const term = await termService.getTerm(name);
      return res.status(200).send(new ResponseDto(200, "약관 조회 성공", term));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 약관 추가
  createTerm: async (req, res) => {
    try {
      // 입력 검증
      const errors = validateReq(req);
      if (errors) {
        return res.status(400).send(new ResponseDto(400, errors));
      }

      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const newTerm = await termService.createTerm(req.body);
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 추가 성공", newTerm));
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },

  updateTerms: async (req, res, next) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).send(users);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
};
