var videos = [];
var ID = 0;
var tries = 2;
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
var room = window.location.hash.slice(1);
var name = "";

$(document).ready(function() {
	// make sure users are in a room
	if (room == "") {
		initNewRoom();
	}

	init();

	// give user ID
	ID = getID();

	if (ID == 0) {
		/* game */
		$("#pickNames").show();
		$("#home").hide();
		$("#game").show();
		$("#messages").hide();
		$("#answers").hide();
	} else {
		/* homepage */
		$("#home").show();
		$("#game").hide();
		$("#pickNames").hide();
	}

	$("#messages").hide();
	$("#answers").hide();

	$("#singleplayer").on('click', function(e) {
		alert("TO DO");
	});

	$("#multiplayer").on('click', function(e) {
		$("#home").hide();
		$("#game").show();
		initChat();
	});

	$("#hideShowMessages").on('click', function(e) {
		$("#messages").toggle();
	});
});

/* room */

var initNewRoom = function() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 8;
	var randomstring = '';
	for(var i = 0; i < string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum, rnum + 1);
	}

	window.location.hash = randomstring;
	location.reload();
}

/* video */
var cloneVideo = function(domId, socketId) {
	var video = document.getElementById(domId);
	var clone = video.cloneNode(false);
	clone.id = "opponent" + socketId;
	document.getElementById('videos').appendChild(clone);
	videos.push(clone);
	return clone;
}

function init() {
	if(PeerConnection) {
		rtc.createStream({
			"video": {"mandatory": {}, "optional": []},
			"audio": true
		}, function(stream) {
				document.getElementById('opponent').src = URL.createObjectURL(stream);
				document.getElementById('opponent').play();
			});
	} else {
		alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
	}

	room = window.location.hash.slice(1);

	rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	rtc.on('add remote stream', function(stream, socketId) {
		console.log("ADDING REMOTE STREAM...");
		var clone = cloneVideo('opponent', socketId);
		document.getElementById(clone.id).setAttribute("class", "flip");
		rtc.attachStream(stream, clone.id);
		getNames();
	});

	rtc.on('disconnect stream', function(data) {
		console.log('remove ' + data);
		removeVideo(data);
	});

	$("#newRoom").on('click', initNewRoom);
}


function removeVideo(socketId) {
	var video = document.getElementById('remote' + socketId);
	if(video) {
		videos.splice(videos.indexOf(video), 1);
		video.parentNode.removeChild(video);
	}
}

/* chat */

function addToChat(msg, color) {
	var messages = document.getElementById('messages');
	msg = sanitize(msg);
	if(color) {
		msg = '<span style="color: ' + color + '; padding-left: 5px">' + msg + '</span>';
	} else {
		msg = '<strong style="padding-left: 5px">' + msg + '</strong>';
	}
	messages.innerHTML = messages.innerHTML + msg + '<br>';
	messages.scrollTop = 10000;
}

function sanitize(msg) {
	return msg.replace(/</g, '&lt;');
}

var websocketChat = {
	send: function(message) {
		rtc._socket.send(message);
	},
	recv: function(message) {
		return message;
	},
	event: 'receive_chat_msg'
};

var dataChannelChat = {
	send: function(message) {
		for(var connection in rtc.dataChannels) {
			var channel = rtc.dataChannels[connection];
			channel.send(message);
		}
	},
	recv: function(channel, message) {
		return JSON.parse(message).data;
	},
	event: 'data stream data'
};

function initChat() {
	var chat;

	if(rtc.dataChannelSupport) {
		console.log('initializing data channel chat');
		chat = dataChannelChat;
	} else {
		console.log('initializing websocket chat');
		chat = websocketChat;
	}

	var input = document.getElementById("chatinput");
	var room = window.location.hash.slice(1);
	var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

	input.addEventListener('keydown', function(event) {
		var key = event.which || event.keyCode;
		if(key === 13) {
			chat.send(JSON.stringify({
				"eventName": "chat_msg",
				"data": {
					"messages": input.value,
					"room": room,
					"color": color
					}
				}));
			addToChat(input.value);
			input.value = "";
		}
	}, false);
	rtc.on(chat.event, function() {
		var data = chat.recv.apply(this, arguments);
		console.log(data.color);
		addToChat(data.messages, data.color.toString(16));
	});
}

var getID = function() {
	var IDSoc = {
		send: function(getID) {
			rtc._socket.send(getID);
		},
		recv: function(getID) {
			return getID;
		}
	}
	$("#multiplayer").on('click', function(e) {
		IDSoc.send(JSON.stringify({
			"eventName": "set_ID",
			"data": {
				"room": room
				}
		}));
	});

	rtc.on('receive_ID', function() {
		var data = IDSoc.recv.apply(this, arguments);
		console.log(data.ID);
		ID = data.ID
	});
}

var getNames = function() {
	$("#pickNames").show();

	var nameSoc = {
		send: function(name) {
			rtc._socket.send(name);
		},
		recv: function(name) {
			return name;
		}
	}

	$("#btnChar").on('click', function(e) {
		nameSoc.send(JSON.stringify({
			"eventName": "set_name",
			"data": {
				"name": $("#character").val(),
				"room": room
				}
		}));
		$("#name").html($("#character").val());
		$("#pickNames").hide();
		if (ID == 1) {
			$("#answers").show();
		}
		getAnswers();
	});

	rtc.on('receive_name', function() {
		var data = nameSoc.recv.apply(this, arguments);
		console.log(data.name);
		name = data.name;
	});
}

var getAnswers = function() {
	var answerSoc = {
		send: function(answer) {
			rtc._socket.send(answer);
		},
		recv: function(answer) {
			return answer;
		}
	}

	$("#yes").on('click', function(e) {
		answerSoc.send(JSON.stringify({
			"eventName": "set_answer",
			"data": {
				"ans": '1',
				"room": room
				}
		}));
		$("#answers").hide();
	});


	$("#no").on('click', function(e) {
		answerSoc.send(JSON.stringify({
			"eventName": "set_ans",
			"data": {
				"ans": '0',
				"room": room
				}
		}));
		$("#answers").hide();
	});

	rtc.on('receive_ans', function() {
		alert('rcv');
		
		var data = answerSoc.recv.apply(this, arguments);
		console.log(data.ans);
		var ans = parseInt(data.ans, 10);
		if (ans == 0) {
			if (tries > 1) {
				tries -= 1;
				$("#answers").show();
			} else {
				youLose();
			}
		} else if (ans == 0) {
			youWin();
		}
		
	});
}

var youLose = function() {
	alert('you lose!');
}

var youWin = function() {
	alert('you win!');
}

