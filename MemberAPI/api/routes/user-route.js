const express=require('express');
const router=express.Router();
const UserController = require('../controllers/user-controller');

//회원가입 API 라우터
router.post('/register',UserController.register_controller);

//로그인 API 라우터
router.post('/login',UserController.login_controller);

//회원정보 수정 API 라우터
router.patch('/auth/patch',UserController.user_update_controller);

//회원탈퇴 API 라우터
router.patch('/auth/delete',UserController.user_delete_controller);

//이메일 인증코드 생성 및 DB 저장, 전송 API 라우터
router.patch('/send-verification-code',UserController.send_verification_code_controller);

//이메일 인증코드 검증 API 라우터
router.get('/verify-code',UserController.verify_code_controller);

//이메일 인증코드 삭제 API 라우터(인증 완료시, 또는 페이지 이전으로 돌아가거나 변경시 삭제)
router.patch('/verify-code-delete',UserController.email_verification_code_delete_controller);

//비밀번호 변경 시, 이전의 password와 다른지 확인 -> 비밀번호 재설정 API 라우터
router.patch('/password_change',UserController.password_change_controller);

//나의 정보 전체 조회 API(비밀번호는 제외) 라우터
router.get('/auth/mypage',UserController.mypage_controller);

//약관 동의 정보 전체 조회 API 라우터
router.get('/auth/mypage_terms',UserController.mypage_terms_controller);

//포인트 변경 시, 등급 수정 API 라우터
router.patch('/auth/point',UserController.point_controller);

//약관동의 등룍 API
router.post('/terms',UserController.terms_register_controller);

//약관동의 수정 API(동의 필수 아닌 약관만 수정가능)
router.patch('/auth/terms/update',UserController.terms_update_controller);

module.exports = router;