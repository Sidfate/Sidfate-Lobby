/* 
 * chatrooms
 * 前端页面逻辑实现
 * @author: Sidfate
 * @date: 2017年3月3日10:59:12
 * 
 */


function init() {
	// highlight 启用
	hljs.initHighlightingOnLoad()
	// tooltip
	$('[data-toggle="tooltip"]').tooltip()
	// toastr 配置
	toastr.options = {
		positionClass: 'toast-bottom-right'
	}
	console.log($('.trpChatContainer')[0].scrollHeight)
	$('.trpChatContainer').scrollTop($('.trpChatContainer')[0].scrollHeight)

	// 键盘事件监听
	$(document).on('keydown', '#chat-input-textarea', function(e) {  
		var textarea = $('#chat-input-textarea') 

		if(e.which == 13) {  
			if(e.ctrlKey) {
				textarea.val(textarea.val()+'\n')
			}else {
				var textValue = $.trim(textarea.val())
				if(textValue) { 
					socket.emit('sendMessage', {message: markdown.toHTML(textarea.val())})
					textarea.val('')
					$('.trpChatContainer').scrollTop($('.trpChatContainer')[0].scrollHeight)
				}
				
				return false
			}
		} 
		if(textarea.val() == '') {
			textarea.css('height', 'auto')
		}

		var height = textarea.height()
		var scrollHeight = textarea[0].scrollHeight
		if(scrollHeight > height) {
			textarea.height(scrollHeight)
		}
	})
}

// socket监听
function socketClinet() {
	var socket = io.connect()
	socket.on('systemMessage', function(result) {
		createSystemMsg(result.username, result.message)
	})
	socket.on('chatMessage', function(result) {
		createChatMsg(result.user, result.message, result.time)
	})
	socket.on('peopleMessage', function(result) {
		createPeopleMsg(result)
		$('#people-number').text(parseInt($('#people-number').text())+1)
	})
	socket.on('showOnlineUsers', function(result) {
		if(result) {
			for(var i in result) {
				createPeopleMsg(result[i])
			}
			$('#people-number').text(Object.keys(result).length)
		}
	})
	socket.on('disconnect', function() {
		//alert('离开');
	})

	/**
	 * 系统消息创建      
	 */
	function createSystemMsg(username, message, time) {
		var html = '<li class="activity-item"><span class="mention">'+username+'</span>'+message+'</li>'
		$('#user-activity').prepend(html)
	}

	/**
	 * 聊天信息创建
	 */
	function createChatMsg(user, message, time) {
		var html = '\
		<div class="chat-item">\
			<div class="chat-item__container">\
				<div class="chat-item__aside">\
					<div class="chat-item__avatar" data-toggle="tooltip" data-placement="bottom" title="'+user.name+'">\
						<span class="widget">\
							<div class="trpDisplayPicture avatar-s">\
								<img src="'+user.avatar+'" height="30" width="30" class="avatar__image">\
							</div>\
						</span>\
					</div>\
				</div>\
				<div class="chat-item__actions">\
					\
				</div>\
				<div class="chat-item__content">\
					<div class="chat-item__details">\
						<div class="chat-item__from">'+user.name+'</div>\
						<div class="chat-item__username">@'+user.login+'</div>\
						<a class="chat-item__time">'+getNowFormatDate(time)+'</a>\
					</div>\
					<div class="chat-item__text">\
						'+message+'\
					</div>\
				</div>\
			</div>\
		</div>\
		'

		$('#chat-container div').eq(0).append(html)
		$('.trpChatContainer').scrollTop($('#chat-container div')[0].scrollHeight)
		$('pre code').each(function(i, block) {
		    hljs.highlightBlock(block);
		});
		$('[data-toggle="tooltip"]').tooltip();
	}

	/**
	 * 用户信息创建
	 */
	function createPeopleMsg(user) {
		var html = '\
		<li>\
			<div class="trpDisplayPicture avatar-s" data-uid="'+user.id+'" data-toggle="tooltip" data-placement="left" title="'+user.name+'">\
				<img src="'+user.avatar+'" class="avatar__image" >\
			</div>\
		</li>';
		$('#roster-view').append(html);
		$('[data-toggle="tooltip"]').tooltip();
	}

	/**
	 * 转换时间格式
	 */
	function getNowFormatDate(timestamp) {
	    var date = new Date();
		date.setTime(timestamp * 1000);
	    var seperator1 = "-"
	    var seperator2 = ":"
	    var month = date.getMonth() + 1
	    var strDate = date.getDate()
	    if (month >= 1 && month <= 9) {
	        month = "0" + month
	    }
	    if (strDate >= 0 && strDate <= 9) {
	        strDate = "0" + strDate
	    }
	    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
	            + " " + date.getHours() + seperator2 + date.getMinutes()
	            + seperator2 + date.getSeconds()
	    return currentdate
	}

	return socket
}
init();
var socket = socketClinet();

// 数据业务
new Vue({
	el: '.chat-header-wrapper',
	data: {
		user: {
			name: '',
			avatar: 'https://avatars1.githubusercontent.com/u/25644507?v=3&s=30',
			login: '',
			id: 0
		},
		socket: null,
		isLogin: false,
		share: {
			url: document.URL,
			copied: false
		}
	},
	methods: {
		showDropdown: function() {
			var toggle = $('#chat-settings').attr('data-toggle')
			if(toggle == 'tooltip') {
				$('#chat-settings').tooltip('toggle').attr('data-toggle', 'dropdown').dropdown()
			}else {
				$('#chat-settings').dropdown('hide').attr('data-toggle', 'tooltip').tooltip()
			}
			
		},
		logout: function() {
			var that = this

			this.$http.post('/user/logout').then(response=> {
				that.isLogin = false
				that.user = {
					name: '',
					avatar: 'https://avatars1.githubusercontent.com/u/25644507?v=3&s=30',
					login: '',
					id: 0
				}
				//$('#login-modal').modal('show')
			}, response => {
				toastr.error(response.body.error)
			})
		},
		copyShareUrl: function() {
			$('#share-modal .share-view__copy-field').select()
			document.execCommand("copy")
			$('#share-modal .js-copy').text('copied!').focus()
		},
		showModal: function(name) {
			if(name == 'share') {
				$('#share-modal .js-copy').text('copy')
			}
			$('.modal').modal('hide')
			$('#'+name+'-modal').modal('show')
		},
		rightToolbarRetract: function() {
			var display = $('#remaining-region').css('display')

			if(display == 'none') {
				$('#remaining-region').show()
				$('#top-header').show()
				$('#activity-region').show()
				$("#right-toolbar-layout").animate({width:"300px"})
				$("#people-list").css('width', '300px')
				$('#right-toolbar-footer-region').css('width', '300px')
			}else {
				$('#remaining-region').hide()
				$('#top-header').hide()
				$('#activity-region').hide()
				$("#right-toolbar-layout").animate({width:"70px"})
				$("#people-list").css('width', '70px')
				$('#right-toolbar-footer-region').css('width', '70px')
			}
		}
	},
	created: function() {
		var that = this

		this.$http.post('/user').then(response=> {
			if(response.status == 203) {
				that.showModal('login')
			}else {
				that.isLogin = true
				that.user = response.body.user
			}
		}, response => {
		})
	},
	watch: {
		isLogin: function(val) {
			if(val) {
				socket.emit('login', {user: this.user})
			}
		}
	}
})