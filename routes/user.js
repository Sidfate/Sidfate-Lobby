var express = require('express');
var router = express.Router();
var request = require('request');
var qs = require('querystring');
var config = require('../config.js');
var gitConfig = config.git_oauth;

// 获取用户信息
router.post('/', function(req, res, next) {
	var user = req.cookies.user;

	if(!user) {
		res.status(203).json({ error: '未登陆' });
	}else {
		result = {
			name: user.name,
			login: user.login,
			avatar: user.avatar_url,
			id: user.id
		}
		res.json({user: result})
	}
})

// 授权
router.get('/oauth/github', function(req, res, next) {
    var url = "https://github.com/login/oauth/authorize/?";
    var params = {
    	state: (new Date()).valueOf(),
    	client_id: gitConfig.clientId
    }

    res.redirect(url+qs.stringify(params));
})

// 回调
router.get('/login/github', function(req, res, next) {
	var code = req.param('code');
    var state = req.param('state');
    var url = "https://github.com/login/oauth/access_token/";

    oauth = {
    	'client_id': gitConfig.clientId,
    	'client_secret': gitConfig.clientSecret,
    	'code': code,
    	'state': state
    }
	request.post({url:url, form: oauth}, function (e, r, body) {
		if (!e && r.statusCode == 200) {
			var access_token = getUrlParam(body, 'access_token')

			if(access_token) {
				var options = {
				  	url: 'https://api.github.com/user?access_token='+access_token,
				  	headers: {
				    	'User-Agent': 'request'
				  	}
				};
				request.get(options, function (e, r, body) {
					if (!e && r.statusCode == 200) {
						var info = JSON.parse(body);
						res.cookie('user', info);
						res.redirect('/chat');
					}
				})
			}
		}
	})
})

// 退出登录
router.post('/logout', function(req, res, next) {
	var user = req.cookies.user;

	if(!user) {
		res.status(500).json({ error: '未登陆' });
	}else {
		res.clearCookie('user');
	}
	res.json();
})

var getUrlParam = function(str, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    var r = str.match(reg); 
    if (r != null) 
    	return unescape(r[2]); 
    return null; 
}

module.exports = router;
