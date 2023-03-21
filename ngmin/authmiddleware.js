/**
 * 요청 헤더를 확인하여 accesstoken으로 JWT가 전달되었는지 확인하고 
 * JWT를 검증(확인)하여 유효하면 tokenInfo에 데이터를 추가하고 
 * 다음 체인으로 처리되게 합니다. 그러나 유효하지 않으면 상태 코드를 403으로 처리를 중지시킵니다.
 */
const jwt = require('jsonwebtoken');
const config = require('./config.js');


const authMiddleware = async (req, res, next) => {
	const accessToken = req.header('Access-Token');
	//jwt 토큰이 null인 경우 인증 실패(403)
	if (accessToken == null) {
		res.status(403).json({success:false, errormessage:'Authentication fail'});
	} else {
		try {
			const tokenInfo = await new Promise((resolve, reject) => {
				//verify 함수통해 토큰 검증
				jwt.verify(accessToken, config.secret, 
					(err, decoded) => {
						if (err) {
							reject(err);
						} else {
							resolve(decoded);
						}
					});
			});
			req.tokenInfo = tokenInfo;
			next();
		} catch(err) {
			console.log(err);
			res.status(403).json({success:false, errormessage:'Authentication fail'});
		}
	}
}

module.exports = authMiddleware; //생성 된 미들웨어 export