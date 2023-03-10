const mysql=require('mysql');
const dbConfig={
    host: '127.0.0.1', // 여기 수정함
    user: 'root',
    password: '12345678',
    database: 'shopdb',
    port: '3306',
};
var pool = mysql.createPool(dbConfig); // DB 커넥션 생성
module.exports=pool;