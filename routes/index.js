var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

// 获取用户信息
router.post('/user', function(req, res, next) {
	var user = req.cookies.user;

	if(!user) {
		res.status(203).json({ error: '未登陆' });
	}else {
		res.json({user: user})
	}
})

// 用户登录
router.post('/login', function(req, res, next) {
	var user = req.cookies.user;

	if(!user) {
		var name = req.param('name');
		var avatar = req.param('avatar');
		var email = req.param('email');

		if(!name) {
			res.status(400).json({ error: '用户名必填' });
		}
		if(!email) {
			res.status(400).json({ error: '邮箱必填' });
		}
		user = {
			name: name,
			avatar: avatar,
			email: email
		};
		res.cookie('user', user)
		res.json({user: user});
	}else {
		// 提示已登录
		res.status(500).json({ error: '您已登陆' });
	}
	
})

function isEmptyObject(e) {  
    var t;  
    for (t in e)  
        return !1;  
    return !0  
}  

module.exports = router;
