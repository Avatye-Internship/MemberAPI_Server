
var express=require("express");
var bodyParser=require('body-parser');

const pool=require('./db_connect');

const app=express();
app.set('port',process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

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

app.listen(app.get('port'),()=>{  //서버 시작!!! 꼭 해야함~~ 중요!
  console.log(app.get('port'),'번 포트에서 대기중');
})