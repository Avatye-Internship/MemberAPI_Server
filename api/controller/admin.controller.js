const { validationResult } = require("express-validator");
const passport = require("passport");
const { BadRequestError } = require("restify-errors");

const ResponseDto = require("../model/ResponseDto.js");
const termService = require("../service/term.service.js");
const userService = require("../service/user.service.js");
const { validateReq } = require("./user.controller.js");

module.exports = {
  // 유저 목록 조회
  getUsersfilter: async (req, res, next) => {
    try {
      const { role, gender, grade, provider } = req.query;
      console.log(role, gender, grade, provider);
    } catch (error) {}
  },

  // 유저 목록 조회
  getUsers: async (req, res, next) => {
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const users = await userService.getUsers();
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 목록 조회 성공", users));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 유저 id로 조회
  getUser: async (req, res, next) => {
    const { id } = req.params;
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      }

      // 회원 id 존재하는지 검사
      const userExist = await userService.getUser(id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다", null));
      }
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 조회 성공", userExist));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 유저 정보 수정
  updateUser: async (req, res, next) => {
    const { id } = req.params;
    const userReq = req.body;
    try {
      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 입력 검증
      const errors = validateReq(req);
      if (errors) {
        return res.status(400).send(new ResponseDto(400, errors));
      }

      // 회원 id 존재하는지 검사
      const userExist = await userService.getUser(id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }
      const newUser = await userService.updateUser(id, userReq);
      return res
        .status(200)
        .send(new ResponseDto(200, "회원 정보 수정 성공", { id: newUser }));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 유저 등급 수정
  updateUserGrade: async (req, res, next) => {
    const { id } = req.params;
    const { grade } = req.body;
    try {
      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 입력 검증
      const errors = validateReq(req);
      if (errors) {
        return res.status(400).send(new ResponseDto(400, errors));
      }

      // 유저 id, 등급 id 존재하는지 확인
      const userExist = await userService.getUser(id);
      const gradeExist = await userService.getGrade(id);

      if (userExist && gradeExist) {
        const newUser = await userService.updateUserGrade(id, grade);
        return res.status(200).send(
          new ResponseDto(200, "회원 등급 수정 성공", {
            id: newUser,
            gradeName: gradeExist.gradeName,
          })
        );
      } else if (!(userExist && gradeExist)) {
        return res
          .status(404)
          .send(
            new ResponseDto(
              404,
              "해당 회원 id, 등급 id가 존재하지 않습니다.",
              null
            )
          );
      } else if (userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다. "));
      } else if (gradeExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 등급 id가 존재하지 않습니다"));
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  },

  // 등급 내용 수정
  updateGrade: async (req, res, next) => {
    const { id } = req.params;
    const grade = req.body;

    try {
      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 입력 검증
      const errors = validateReq(req);
      if (errors) {
        return res.status(400).send(new ResponseDto(400, errors));
      }

      // 등급 id 존재하는지 확인
      const gradeExist = await userService.getGrade(id);
      if (!gradeExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 등급 id가 존재하지 않습니다"));
      }

      const newGrade = await userService.updateGrade(id, grade);
      return res
        .status(200)
        .send(new ResponseDto(200, "등급 내용 수정 성공", { id: newGrade }));
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  },
};
