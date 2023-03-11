
const express=require("express");
const bodyParser=require('body-parser');
const validator=require('validator');

const pool=require('./db_connect');

const app=express();
app.set('port',process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.listen(app.get('port'),()=>{  //서버 시작!!! 꼭 해야함~~ 중요!
  console.log(app.get('port'),'번 포트에서 대기중');
})

//회원조회
const find=require('./src/queries/user-query')

app.get('/user',(req,res)=>{
  pool.getConnection((err,conn)=>{
    conn.query(find,(err,rows,fields)=>{
      if(err){
        console.log('데이터 못 가져옴');
      }else{
        res.send(rows);
      }
    })
  })
})

//회원가입 API
const have_user='SELECT * FROM usertbl WHERE user_id = ?';
const register='INSERT INTO usertbl SET ?';

const validateUser=(user)=>{
  var {user_id,password,name,gender,phone,birth}=user;
  const minLength=8;
  const maxLength=15;
  const phoneRegex=/^\d{3}-\d{3,4}-\d{4}$/;

  const errors=[];

  if(!user_id||!validator.isEmail(user_id)){
    errors.push('이메일을 다시 입력해주세요');
  }

  if(!password||!validator.isLength(password,{min:minLength,max:maxLength})){
    errors.push(`비밀번호를 ${minLength}자 이상 ${maxLength}자 이하로 입력해주세요`);
  }

  if(!name){
    errors.push('이름을 입력하지 않았습니다');
  }

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

app.post('/register',(req,res)=>{
  var user=req.body;

  const errors=validateUser(user);

  if(errors.length){
    return res.status(400).json({message:RESPONSE_MESSAGES.VALIDATION_ERROR,errors});
  }

  //데이터베이스에서 해당 이메일 주소가 이미 등록되어 있는지 확인!
  pool.getConnection((err,conn)=>{
    conn.query(have_user,[user.user_id],(err,results,fields)=>{
      if(err){
        console.log('Error registering user: ',err);
        return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
      }

      if(results.length>0){
        return res.status(409).json({message:RESPONSE_MESSAGES.EMAIL_EXISTS});
      }

      conn.query(register,user,(err,results,fields)=>{
        if(err){
          console.log('Error registering user: ',err);
          return res.status(500).json({message:RESPONSE_MESSAGES.SERVER_ERROR});
        }

        res.status(201).json({message:RESPONSE_MESSAGES.REGISTER_SUCCESS});
      })
    })
  })
})

//로그인 API
const login_query='SELECT * FROM usertbl WHERE user_id = ? AND password=?';

app.post('/login',(req,res)=>{
  const {user_id,password}=req.body;

  pool.getConnection((err,conn)=>{
    conn.query(login_query,[user_id,password],(err,results)=>{
      if(err){
        console.log(err);
        res.status(500).send('서버 오류');
      }else{
        if(results.length>0){
          //로그인 성공
          res.send('로그인 성공!');
        }else{
          //로그인 실패
          res.status(401).send('로그인 실패');
        }
      }
    })
  })
})

//회원정보 수정 API
const user_update_query=`UPDATE usertbl SET name=?, password=?, gender=?, phone=?, birth=? WHERE user_id=?`;
