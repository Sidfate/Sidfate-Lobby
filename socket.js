/* 
 * chatrooms: socket.io服务器
 * 
 * 
 */


var socketio = require('socket.io'),
	redis = require('redis'),
    redis_client = redis.createClient(),
	io,
	users = {},
	onlines = {},
	currentRoom = {};

function getNow() {
	return Date.parse(new Date())/1000
}

exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level', 1);

	//用户连接处理
	io.sockets.on('connection', function(socket) {

		// 默认加入房间 1
		joinRoom(socket, 1);

		// 用户登录时间
		socket.on('login', function(data) {
			var user = data.user;
			users[socket.id] = user;

			if(!onlines[user.id]) {
				socket.broadcast.to(currentRoom[socket.id]).emit('systemMessage', {
					username: user.name,
					message: " has joined in." 
				});

				socket.broadcast.to(currentRoom[socket.id]).emit('peopleMessage', user);
				socket.emit('peopleMessage', user);

				onlines[user.id] = user;
			}
			
		});

		// 消息处理事件
		socket.on('sendMessage', function(data) {
			var user = users[socket.id];
			var time = getNow();
			var chat_data = {
				user: user,
				message: data.message,
				time: time
			}

			redis_client.rpush('chat_log', JSON.stringify(chat_data));
			redis_client.expire('chat_log', 3600*24*7);

			socket.broadcast.to(currentRoom[socket.id]).emit('chatMessage', chat_data);
			socket.emit('chatMessage', chat_data);
		});

		// 断开处理事件
		// socket.on('disconnect', function() {

		// });
	});
};

/*
 *	加入房间
 */
function joinRoom(socket, room) {
	socket.leave(socket.id);
	socket.join(room);
	currentRoom[socket.id] = room;

	socket.emit('showOnlineUsers', onlines);
}

/*
 *	创建房间
 */
function handleRoomJoining(socket) {
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

/*
 *	用户断开连接
 */
function handleClientDisconnection(socket) {
	socket.on('disconnect', function() {
		// var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		// delete namesUsed[nameIndex];
		// delete nickNames[socket.id];
	});
}