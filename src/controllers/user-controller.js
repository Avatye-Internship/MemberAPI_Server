const UserQuery = require('../queries/user-query');
const express=require("express");
const bodyParser=require('body-parser');
const validator=require('validator');
const pool=require('/Users/namgyeongmin/Documents/avatyeproject-express/db_connect.js');
const crypto = require('crypto'); //비밀번호 암호화
const jwt = require("jsonwebtoken"); //jwt 토큰
const config = require('/Users/namgyeongmin/Documents/avatyeproject-express/config.js');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

//유효성 검사 에러 처리 함수
const validateUser=(user)=>{
    var {user_id,password,name,gender,phone,birth}=user;
    const minLength=8;
    const maxLength=15;
    const phoneRegex=/^\d{3}-\d{3,4}-\d{4}$/;
  
    const errors=[];
  
    //이메일 유효성 검사 => null값 아닌지, 이메일 형식에 맞게
    if(!user_id||!validator.isEmail(user_id)){
      errors.push('이메일을 다시 입력해주세요');
    }
  
    //비밀번호 유효성 검사 => null값 아닌지, 8자 이상 15자 이하
    if(!password||!validator.isLength(password,{min:minLength,max:maxLength})){
      errors.push(`비밀번호를 ${minLength}자 이상 ${maxLength}자 이하로 입력해주세요`);
    }
  
    //이름 유효성 검사 => null 값 아닌지 판단
    if(!name){
      errors.push('이름을 입력하지 않았습니다');
    }
  
    //전화번호 유효성 검사 => null 값 아닌지, 전화번호 양식에 맞는지
    if(!phone||!phoneRegex.test(phone)){
      errors.push('올바른 전화번호를 입력해주세요 (010-1234-5678)');
    }
  
    return errors;
}

const RESPONSE_MESSAGES = {
    SERVER_ERROR: '서버 에러',
    EMAIL_EXISTS: '이미 존재하는 이메일입니다.',
    VALIDATION_ERROR: '입력값이 유효하지 않습니다.',
    REGISTER_SUCCESS: '회원가입 성공!'
};

//메일 보내는 user 생성
const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: 'ngm9464@gmail.com',
      pass: config.pass
    }
}));
//인증코드 생성
const generateVerificationCode = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

//회원가입 API 컨트롤러
exports.register_controller=async (req,res)=>{
    try{
      const user=req.body;
      const password=user.password;
    
      //crypto 사용해 비밀번호 암호화
      //현재 시간 값을 기반으로 생성된 난수 반올림하여 문자열로 변환(비밀번호 보안성) = salt
      const salt=Math.round((new Date().valueOf()*Math.random()))+"";
      //crypto 모듈 사용하여 sha512 알고리즘으로 해시값 생성, 비밀번호와 salt 조합해 16진수 문자열 형태로 변환
      const hashPassword=crypto.createHash("sha512").update(password+salt).digest("hex");
  
      const errors= validateUser(user);
      //입력값 유효성 검사 에러 처리 -> 400(잘못된 요청)
      if(errors.length){
        return res.status(400).json({message:RESPONSE_MESSAGES.VALIDATION_ERROR,errors});
      }
      var param={
        user_id:user.user_id,
        password:hashPassword,
        name:user.name,
        gender:user.gender,
        phone:user.phone,
        birth:user.birth,
        salt:salt
      }
      try{
        const conn=await pool.getConnection();
        //데이터베이스에서 해당 이메일 주소가 이미 등록되어 있는지 확인!
        const [rows]=await conn.query(UserQuery.have_user_query,[user.user_id]);
        //중복 이메일 에러 처리(409)
        if(rows.length>0){
          return res.status(409).json({message:RESPONSE_MESSAGES.EMAIL_EXISTS});
        }
        //회원 등록
        [results]=await conn.query(UserQuery.register_query,param);
        //회원가입 성공
        return res.status(201).json({message:RESPONSE_MESSAGES.REGISTER_SUCCESS});
      }catch(err){
        //내부 서버 에러 처리(500)
        console.log('Error registering user: ',err);
        return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
      }
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//로그인 API 컨트롤러
exports.login_controller=async (req,res)=>{
    const {user_id,password}=req.body;
  
    try{
      const conn=await pool.getConnection();
      [rows]=await conn.query(UserQuery.have_user_query,[user_id]);
  
      //아이디, 비밀번호 없는 경우 에러처리(401) 또는 회원탈퇴한 경우
      if(rows.length===0 || rows[0].state===0){
        return res.status(401).json({ success: false, errormessage: 'id and password are not identical' });
      }
  
      const dbPassword=rows[0].password;
      //비밀번호 복호화
      const salt=rows[0].salt;
      const hashPassword=crypto.createHash("sha512").update(password+salt).digest("hex");
  
      //db의 회원 비밀번호와 일치하지 않는 경우
      if(dbPassword!==hashPassword){
        return res.status(401).json({ success: false, errormessage: 'id and password are not identical' });
      }
  
       //jwt 토큰 생성
      const payload={user:{id:user_id}};
      jwt.sign(payload,config.secret, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          //토큰 생성 실패한 경우 에러(401)
          return res.status(401).json({success:false, errormessage:'token sign fail'});
        } else {
          //로그인 성공
          return res.json({success:true, accessToken:token});
        }
      });
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//회원정보 수정 API 컨트롤러
exports.user_update_controller=async(req,res)=>{
    let user_update_query = `UPDATE usertbl SET`; //여기 안에 있어야 에러 안남
    const user_id=req.tokenInfo.user.id; //jwt 토큰으로 user_id 받아옴
    const {name,gender,phone,birth}=req.body;
    const phoneRegex=/^\d{3}-\d{3,4}-\d{4}$/;
  
    //칼럼마다 값이 있으면 쿼리에 삽입
    if (name) {
      user_update_query += ` name = '${name}',`;
    }
    if (gender) {
        user_update_query += ` gender = '${gender}',`;
    }
    //전화번호 유효성 검사 => null 값 아닌지, 전화번호 양식에 맞는지
    if(phone){
      if(!phoneRegex.test(phone)){
        return res.status(409).json({message:'올바른 전화번호를 입력해주세요 (010-1234-5678)'});
      }else{
        user_update_query += ` phone = '${phone}',`;
      }
    }
      
    if (birth) {
        user_update_query += ` birth = '${birth}',`;
    }
    // 맨 마지막 콤마(,) 제거
    user_update_query = user_update_query.slice(0, -1);
    user_update_query += ` WHERE user_id = '${user_id}';`;
    console.log(user_update_query);
    
    try{
      const conn=await pool.getConnection();
  
      const [rows]=await conn.query(user_update_query);
      //
      if(rows.affectedRows===0){
        return res.status(404).json({message:'사용자가 존재하지 않습니다.'});
      }
  
      return res.status(201).json({message:'회원정보 수정 성공'});
  
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//회원 탈퇴 API
//회원 탈퇴시, delete하지 않고 state=0으로 변경해 나중에 서버에서 1년이 지나면 삭제할 예정
exports.user_delete_controller=async (req,res)=>{
    const user_id=req.tokenInfo.user.id; //jwt 토큰으로 user_id 받아옴
    console.log(req.tokenInfo.user.id);
    try{
      const conn=await pool.getConnection();
      conn.query(UserQuery.withdrawal_query,[user_id]);
  
      return res.status(201).json({message:'회원 탈퇴 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//비밀번호 찾기 로직 -> (아이디(이메일) 적으면 이메일 인증)
//=> 인증 완료후 이전 비밀번호와 새 비밀번호 불일치하는지 확인 => 새 비밀번호 수정

//이메일에 인증코드 생성, DB 저장, 전송 API 컨트롤러
exports.send_verification_code_controller=async (req,res)=>{
    const {user_id}=req.body; //사용자가 이메일 입력
    const verificationCode = generateVerificationCode(); //인증코드 생성
    const subject='Avatye 이메일 인증';
    const text=`인증코드는 ${verificationCode} 입니다.`;
    try{
      const conn=await pool.getConnection();
  
      //db에 회원존재하는지, 탈퇴한 회원인지 조회
      const [rows]=await conn.query(UserQuery.have_user_query,[user_id]);
      if(rows.length===0 || rows[0].state===0){
        return res.status(401).json({ success: false, errormessage: 'id and password are not identical' });
      }
  
      //이메일 인증코드 db에 저장
      conn.query(UserQuery.send_verification_code_query,[verificationCode,user_id]);
      var mailOptions={
        from : 'ngm9464@gmail.com',
        to:user_id,
        subject:subject,
        text:text
      };
      info=await transporter.sendMail(mailOptions);  //이메일 전송
      console.log('Email sent: '+info.response);
      return res.status(201).json({message:'이메일 인증코드 전송 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//이메일 인증코드 검증 API
exports.verify_code_controller=async (req, res) => {
    const {user_id,email_verification_code}=req.body;
    try{
      const conn=await pool.getConnection();
  
      //db에 회원존재하는지, 탈퇴한 회원인지 조회
      [rows]=await conn.query(UserQuery.have_user_query,[user_id]);
      if(rows.length===0 || rows[0].state===0){
        return res.status(401).json({ success: false, errormessage: 'id and password are not identical' });
      }
  
      //이메일 인증코드 검증
      [rows]=await conn.query(UserQuery.verify_code_query,[user_id,email_verification_code]);
      if(rows.length===0){
        res.status(401).json({message:'이메일 인증 코드가 일치하지 않습니다.'});
      }
      return res.status(201).json({message:'이메일 인증코드 검증 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//이메일 인증코드 삭제 API 컨트롤러(인증 완료시, 또는 페이지 이전으로 돌아가거나 변경시 삭제)
exports.email_verification_code_delete_controller=async(req,res)=>{
    const {user_id}=req.body;
    try{
      const conn=await pool.getConnection();
  
      //db에 회원존재하는지, 탈퇴한 회원인지 조회
      const [rows]=await conn.query(UserQuery.have_user_query,[user_id]);
      if(rows.length===0||rows[0].state===0){
        return res.status(401).json({ success: false, errormessage: 'id and password are not identical' });
      }
      //인증코드 삭제
      [results]=await conn.query(UserQuery.email_verification_code_delete_query,[user_id]);
      //삭제된 칼럼없는 경우
      if(results.affectedRows===0){
        return res.status(404).json({message: '사용자가 존재하지 않습니다.'});
      }
      return res.status(201).json({message:'이메일 인증코드 삭제 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//비밀번호 변경 시, 이전의 password와 다른지 확인 -> 비밀번호 재설정 API 컨트롤러
exports.password_change_controller=async (req,res)=>{
    const {user_id,newPassword}=req.body;
    let oldPassword;

    try{
      const conn=await pool.getConnection();
  
      //db에 회원존재하는지, 탈퇴한 회원인지 조회
      const [rows]=await conn.query(UserQuery.have_user_query,[user_id]);
      if(rows.length===0||rows[0].state===0){
        return res.status(401).json({ success: false, errormessage: 'id and password are not identical' });
      }

      rows.forEach(row=>{
        oldPassword=row.password; //db의 이전 비밀번호 가져오기
      });
    
      //db의 비밀번호와 입력한 비밀번호 일치, 불일치 확인
      if(oldPassword===newPassword){
        return res.send('이전 비밀번호와 일치합니다. 다른 비밀번호를 입력해주세요');
      }
  
      //crypto 사용해 비밀번호 암호화
      const salt=Math.round((new Date().valueOf()*Math.random()))+"";
      const hashPassword=crypto.createHash("sha512").update(newPassword+salt).digest("hex");
  
      const [results]=await conn.query(UserQuery.change_password_query,[hashPassword,salt,user_id]);
      //비밀번호 유효성 검사 => null값 아닌지, 8자 이상 15자 이하
      if(!newPassword||!validator.isLength(newPassword,{min:8,max:15})){
        return res.status(400).json({message:'비밀번호를 8자 이상 15자 이하로 입력해주세요'});
      }
      return res.status(201).json({message:'비밀번호 재설정 성공'});
  
    }catch(err){
        //내부 서버 에러 처리(500)
        console.log('Error registering user: ',err);
        return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//나의 정보 전체 조회 API(비밀번호는 제외) 컨트롤러
exports.mypage_controller=async(req,res)=>{
    const user_id=req.tokenInfo.user.id; //jwt 토큰으로 user_id 받아옴
  
    try{
      const conn=await pool.getConnection();
      //사용자의 아이디,이름,성별,전화번호,생일,포인트,등급 항목 전체 조회
      const [rows]=await conn.query(UserQuery.mypage_select_query,[user_id]);
  
      if(rows.length===0){ //조회 정보 없는경우
        return res.status(401).json({ success: false, errormessage: '조회 정보가 없습니다.' });
      }
      console.log(rows);
      return res.status(201).json({message:'나의 정보 전체 조회 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//약관 동의 정보 전체 조회 API 컨트롤러
exports.mypage_terms_controller=async(req,res)=>{
    const user_id=req.tokenInfo.user.id; //jwt 토큰으로 user_id 받아옴
  
    try{
      const conn=await pool.getConnection();
      //사용자의 약관동의 정보 항목 전체 조회
      const [rows]=await conn.query(UserQuery.mypage_terms_select_query,[user_id]);
  
      if(rows.length===0){
        return res.status(401).json({ success: false, errormessage: '조회 정보가 없습니다.' });
      }
      console.log(rows);
      return res.status(201).json({message:'나의 약관동의 정보 조회 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//포인트 변경 시, 등급 수정 API 컨트롤러
exports.point_controller=async(req,res)=>{
    const user_id=req.tokenInfo.user.id; //jwt 토큰으로 user_id 받아옴
    const point=req.body.point;
    let gradeId;
    try{
      const conn=await pool.getConnection();
      //포인트 변경
      [results]=await conn.query(UserQuery.point_update_query,[point,user_id]);
      if(results.affectedRows===0){ //조회결과가 없을시
        return res.status(404).json({message:'조회 결과가 없습니다.'});
      }
      
      //등급 최소값, 최대값에 따라 등급 자동 변경을 위한 등급table 조회
      [rows]=await conn.query(UserQuery.grade_select_query);
      console.log(rows);
  
      //for문을 이용해 사용자 포인트가 최소값,최대값 사이에 있는 등급 찾아냄
      for(var i=0;i<rows.length;i++){
        if(rows[i].minvalue<= point && point <=rows[i].maxvalue){
          gradeId= rows[i].grade_id;
          console.log(gradeId);
          break;
        }
      }
      //등급 수정
      [results]=await conn.query(UserQuery.grade_update_query,[gradeId,user_id]);
      if(results.affectedRows===0){
        return res.status(404).json({message:'조회 결과가 없습니다.'});
      }
  
      return res.status(201).json({message:'포인트 변경 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//약관동의 등룍 API 컨트롤러
exports.terms_register_controller=async(req,res)=>{
    let terms_register_query=`INSERT INTO user_terms_tbl (user_id, terms_id,agree_check) VALUES`; //안에 있어야 바로 실행할때 에러안남
    const user_id=req.body.user_id;
    const user_terms=req.body.users;
  
    try{
      const conn=await pool.getConnection();
  
      [results]=await conn.query(UserQuery.terms_select_query);
      console.log(results);
  
      //약관동의별 insert 쿼리문 추가
      for(let i=0; i<user_terms.length;i++){
        //약관동의 필수 여부에 따른 에러
        if(results[i].required==1 && user_terms[i].agree_check==0){
          return res.status(400).json({message:'해당 약관동의는 필수입니다.'});
        }
        terms_register_query+=`('${user_id}','${user_terms[i].terms_id}','${user_terms[i].agree_check}'),`;
      }
      terms_register_query = terms_register_query.substring(0,terms_register_query.length-1)+";";
  
      //데이터베이스에서 해당 이메일 주소가 이미 등록되어 있는지 확인!
      [rows]=await conn.query(UserQuery.user_terms_select_query,[user_id]);
      //중복 이메일 에러 처리(409)
      if(rows.length>0){
        return res.status(409).json({message:RESPONSE_MESSAGES.EMAIL_EXISTS});
      }
  
      //약관동의 등록
      [results]=await conn.query(terms_register_query);
      if(results.affectedRows===0){
        return res.status(404).json({message:'등록된 것이 없습니다.'});
      }
      return res.status(201).json({message:'사용자별 약관동의 등록 성공'});
  
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}

//약관동의 수정 API(동의 필수 아닌 약관만 수정가능) 컨트롤러
exports.terms_update_controller=async(req,res)=>{
    const user_id=req.tokenInfo.user.id; //jwt 토큰으로 user_id 받아옴;
    let agree_check=req.body.agree_check;
    try{
      const conn=await pool.getConnection();
      const [rows]=await conn.query(UserQuery.terms_update_query,[agree_check,user_id]);
      console.log(rows);
      if(rows.affectedRows===0){
        return res.status(404).json({message:'사용자가 존재하지 않습니다.'});
      }
      return res.status(201).json({message:'사용자별 약관동의 수정 성공'});
    }catch(err){
      //내부 서버 에러 처리(500)
      console.log('Error registering user: ',err);
      return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
    }
}