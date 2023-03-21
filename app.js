
const express=require("express");
const bodyParser=require('body-parser');
const userRouter = require('./src/routes/user-route');

const app=express();
app.set('port',process.env.PORT || 3002);

//'/members/auth'포함 경로이면 authmiddleware.js로 이동해 JWT 검증을 한 후 처리
app.use('/members/auth',require('./authmiddleware')); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.listen(app.get('port'),()=>{  //서버 시작!!! 
  console.log(app.get('port'),'번 포트에서 대기중');
})

//User관련
app.use('/members',userRouter);
