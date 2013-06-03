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