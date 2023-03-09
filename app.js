const express=require('express');
const morgan=require('morgan'); //요청과 응답에 대한 정보 콘솔에 기록
const cookieParser=require('cookie-parser');
const session=require('express-session');
const dotenv=require('dotenv'); //process.env 관리, .env파일 읽어서 process.env로 만든다
const path=require('path'); 
const bodyParser = require('body-parser');

dotenv.config();
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
 
const app=express();
app.set('port',process.env.PORT || 3000);
  
//app.js에 연결할 때 주소가 합쳐짐
app.use('/', indexRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

app.listen(3000,()=>{  //서버 시작!!! 꼭 해야함~~ 중요!
    console.log("서버 시작!")
})