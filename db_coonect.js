const mysql=require('mysql');
const dbConfig={
    host: '127.0.0.1', // 여기 수정함
    user: 'root',
    password: '12345678',
    database: 'shopdb',
    port: '3306',
};


// connection.connect();   // DB 접속
 
// var testQuery = "SELECT * FROM usertbl";
 
// connection.query(testQuery, function (err, results, fields) { // testQuery 실행
//     if (err) {
//         console.log(err);
//     }
//     console.log(results);
// });
 
var pool = mysql.createPool(dbConfig); // DB 커넥션 생성

pool.getConnection((error, conn)=>{  // getConnection -> 커넥션 풀에서 커넥션 가져오기
    conn.query('SELECT * FROM usertbl', (error, result, fields)=>{
        if (!error) {
            // result
            console.log(result)
            conn.release()  // 커넥션 풀에 커넥션 반환
        } else {
            throw error
        }
    })
})
//connection.end(); // DB 접속 종료, creatConnect은 회선 1개로 게속 연결이 되어있어서 end필요함
//createPool은 실행될 때만 연결되기때문에 end필요없음
 