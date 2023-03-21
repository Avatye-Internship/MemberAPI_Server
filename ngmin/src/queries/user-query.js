//회원가입 API 쿼리, 로그인 API 쿼리
exports.have_user_query='SELECT * FROM usertbl WHERE user_id = ?';
exports.register_query='INSERT INTO usertbl SET ?';

//회원탈퇴 API 쿼리
exports.withdrawal_query=`UPDATE usertbl SET state=0, end_date=NOW() WHERE user_id=?`;

//이메일 인증코드 생성 및 db 저장,전송 API 쿼리
exports.send_verification_code_query=`UPDATE usertbl SET email_verification_code=? WHERE user_id=?`;

//이메일 인증코드 검증 API 쿼리
exports.verify_code_query=`SELECT * FROM usertbl WHERE user_id=? and email_verification_code=?`;

//이메일 인증코드 삭제 API 쿼리(인증 완료시, 또는 페이지 이전으로 돌아가거나 변경시 삭제)
exports.email_verification_code_delete_query=`UPDATE usertbl SET email_verification_code=null WHERE user_id=?`;

//비밀번호 재설정 API 쿼리
exports.change_password_query=`UPDATE usertbl SET password=?, salt=? WHERE user_id=?`;

//나의 정보 전체 조회 API(비밀번호는 제외) 쿼리
exports.mypage_select_query=`select u.user_id,u.name,u.gender,u.phone,u.birth,u.point,g.name as "grade_name" from usertbl u join gradetbl g 
on u.grade_id=g.grade_id where u.user_id =?`;

//약관 동의 정보 전체 조회 API 쿼리
exports.mypage_terms_select_query=`select t.name,ut.agree_check from termstbl t join user_terms_tbl ut 
on t.terms_id=ut.terms_id where ut.user_id =?`;

//포인트 변경 시, 등급 수정 API 쿼리
exports.point_update_query=`UPDATE usertbl SET point=? where user_id=?`;
exports.grade_update_query=`UPDATE usertbl SET grade_id=? where user_id=?`;
exports.grade_select_query=`SELECT * from gradetbl`;

//약관동의 등룍 API 쿼리
exports.user_terms_select_query=`SELECT * FROM user_terms_tbl WHERE user_id=?`;
exports.terms_select_query=`SELECT terms_id,required FROM termstbl`;

//약관동의 수정 API(동의 필수 아닌 약관만 수정가능) 쿼리
exports.terms_update_query=`UPDATE user_terms_tbl SET agree_check=?,agree_datetime=NOW() where terms_id=3 and user_id=?`;