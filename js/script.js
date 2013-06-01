$(document).ready(function() {
	var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
	var room = window.location.hash.slice(1);

	// make sure users are in a room
	if (room == "") {
		initNewRoom();
	}

	/* homepage */
	$("#home").show();
	$("#game").hide();
	$("#messages").hide();
	$("#pickNames").hide();
	$("#answers").hide();

	$("#singleplayer").on('click', function(e) {
		alert("TO DO");
	});

	$("#multiplayer").on('click', function(e) {
		$("#home").hide();
		$("#game").show();
		init();
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

function init() {
	if(PeerConnection) {
		rtc.createStream({
			"video": {"mandatory": {}, "optional": []},
			"audio": true
		}, function(stream) {
				document.getElementById('oponent').src = URL.createObjectURL(stream);
				document.getElementById('oponent').play();
			});
	} else {
		alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
	}

	room = window.location.hash.slice(1);

	rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	rtc.on('add remote stream', function(stream, socketId) {
		console.log("ADDING REMOTE STREAM...");
		var clone = cloneVideo('oponent', socketId);
		document.getElementById(clone.id).setAttribute("class", "");
		rtc.attachStream(stream, clone.id);
		startGame();
	});
	rtc.on('disconnect stream', function(data) {
		console.log('remove ' + data);
		//removeVideo(data);
	});
	$("#newRoom").on('click', initNewRoom);
}

function cloneVideo(domId, socketId) {
	var video = document.getElementById(domId);
	var clone = video.cloneNode(false);
	clone.id = "remote" + socketId;
	document.getElementById('videos').appendChild(clone);
	videos.push(clone);
	return clone;
}

/*
function removeVideo(socketId) {
	var video = document.getElementById('remote' + socketId);
	if(video) {
		videos.splice(videos.indexOf(video), 1);
		video.parentNode.removeChild(video);
	}
}
*/

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
	var toggleHideShow = document.getElementById("hideShowMessages");
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

function startGame() {
	getNames();
}

function getNames() {
	$("#pickNames").show();


}

var websocketNames = {
	send: function(name) {
		rtc._socket.send(name);
	},
	recv: function(name) {
		return name;
	},
	event: 'receive_name'
};