var videos = [];
var ID = 0;
var tries = 15;
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
var room = window.location.hash.slice(1);
var name = "";
var character = {
	'name': 'def',
	'gender': 'def',
	'human': 'def',
	'haircolor': 'def',
	'skincolor': 'def',
	'glasses': 'def',
	'tv': 'def',
	'author': 'def'
};

$(document).ready(function() {
	// make sure users are in a room
	if (room == "") {
		initNewRoom();
	}

	$("#home").show();
	$("#game").hide();
	$("#pickNames").hide();
	$("#messages").hide();
	$("#answerButtons").hide();
	$("#answers").hide();
	$("#guess").hide();
	$("#selectQuestion").hide();

	$("#singleplayer").on('click', function(e) {
		initSingle();
		$("#home").hide();
		$("#game").show();
		$("#chatbox").hide();
	});

	$("#multiplayer").on('click', function(e) {
		$("#home").hide();
		$("#game").show();
		initChat();
		initMulti();
	});

	$("#hideShowMessages").on('click', function(e) {
		$("#messages").toggle();
	});

	$("#turns").html(tries);

	$("#newRoom").on('click', initNewRoom);
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
	$("#videos").prepend(clone);
	videos.push(clone);
	return clone;
}

function initMulti() {
	if(PeerConnection) {
		rtc.createStream({
			"video": {"mandatory": {}, "optional": []},
			"audio": true
		}, function(stream) {
				document.getElementById('opponent').src = URL.createObjectURL(stream);
				document.getElementById('opponent').play();
			});
	} else {
		alert('Your browser does not fully support this game, but you can play the singleplayer mode.');
	}

	room = window.location.hash.slice(1);

	rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	// give user ID
	// need to use Timeout cause the websocket might not open quick enough
	setTimeout(getID, 200);
	setTimeout(getChars, 200);

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

/* game */

var getID = function() {
	var IDSoc = {
		send: function(getID) {
			rtc._socket.send(getID);
		},
		recv: function(getID) {
			return getID;
		}
	}

	IDSoc.send(JSON.stringify({
		"eventName": "set_ID",
		"data": {
			"room": room
			}
	}));

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

	var sendName = function() {
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
			$("#answerButtons").show();
		}
		getAnswers();
		$("#answers").show();
		$("#guess").show();
	}

	$("#btnChar").on('click', function(e) {
		sendName();
	});

	$("#name").keyup(function(e){
		if(e.keyCode == 13)
		{
		  sendName();
		}
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

	var end = false;

	$("#btnYes").on('click', function(e) {
		answerSoc.send(JSON.stringify({
			"eventName": "set_ans",
			"data": {
				"ans": '1',
				"end": end,
				"room": room
				}
		}));
		$("#answerButtons").hide();
	});

	$("#btnNo").on('click', function(e) {
		answerSoc.send(JSON.stringify({
			"eventName": "set_ans",
			"data": {
				"ans": '0',
				"end": end,
				"room": room
				}
		}));
		$("#answerButtons").hide();
	});

	rtc.on('receive_ans', function() {
		var data = answerSoc.recv.apply(this, arguments);
		console.log(data.ans);
		var ans = parseInt(data.ans, 10);
		if (ans == 0) {
			$("#results").append("<li class='answNo'>No</li>");
		} else if (ans == 1) {
			$("#results").append("<li class='answYes'>Yes</li>");
		}
		tries -= 1;
		$("#turns").html(tries);
		if (tries <= 1) {
			$("#turns").html('You must guess now!');
			end = true;
		}
		if (!data.end) {
			$("#answerButtons").show();
		} 
	});
}

$("#btnGuess").on('click', function(e) {
	takeGuess();
});

$("#guessWho").keyup(function(e){
	if(e.keyCode == 13)
	{
	  takeGuess();
	}
});

var takeGuess = function() {
	if (name == $("#guessWho").val()) {
		youWin();
	} else {
		if (tries > 2) {
			tries -= 2;
			$("#turns").html(tries);
		} else if (tries <= 2) {
			tries -= 2;
			$("#turns").html(tries);
			youLose();
		}
	}
}

var youLose = function() {
	notifyWinner();
	alert('you lose! \n You were ' + name);
}

var youWin = function() {
	alert('you win! \n You were ' + name);
}

var notifyWinner = function() {
	var winSoc = {
		send: function(win) {
			rtc._socket.send(win);
		},
		recv: function(win) {
			return win;
		}
	}
	winSoc.send(JSON.stringify({
		"eventName": "set_win",
		"data": {
			"room": room
			}
	}));

	rtc.on('receive_win', function() {
		alert('you win! \n You were' + name);
	});
}


var initSingle = function() {
	room = window.location.hash.slice(1);
	$("#answers").show();
	$("#guess").show();

	rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	// need to use Timeout cause the websocket might not open quick enough
	setTimeout(getChars, 200);

	var questions = {
		'Is it a male?': 'male#gender',
		'Is it a female?': 'female#gender',
		'Is it human?': '1#human',
		'Is it not human?': '0#human',
		'Does it have black hair?': 'black#haircolor',
		'Does it have blond hair?': 'blond#haircolor',
		'Does it have brown hair?': 'brown#haircolor',
		'Does it have red hair?': 'red#haircolor',
		'Does it have grey hair?': 'grey#haircolor',
		'Does it have a black skin?': 'black#skincolor',
		'Does it have a brown skin?': 'brown#skincolor',
		'Does it have a white skin?': 'white#skincolor',
		'Does it have a yellow skin?': 'yellow#skincolor',
		'Does it wear glasses?': '1#glasses',
		'Is it a TV-star?': '1#tv',
		'Is it an author?': '1#author'
	}

	$("#selectQuestion").show();

	$.each(questions, function(key, val) {
		$("#dropdownQ").append("<option value=" + val + ">" + key + "</option>");
	});

	$( "#dropdownQ" ).combobox();

	$("#btnAsk").on('click', function(e) {
		if ($("#dropdownQ").val() != -1) {
			var right = true;
			var Q = $("#dropdownQ option:selected").text();
			var val = $("#dropdownQ").val();
			var value = val.split('#')[0];
			var field = val.split('#')[1];
			
			if(character[field] == value) {
				right = true;
			} else {
				right = false;
			}

			if (!right) {
				$("#results").append("<li class='answNo'>" + Q + " No</li>");
			} else if (right) {
				$("#results").append("<li class='answYes'>" + Q + " Yes</li>");
			}
			tries -= 1;
			$("#turns").html(tries);
			if (tries == 1) {
				$("#turns").html('You must guess now!');
			}
		}
	});
}

var getChars = function() {
	var charsSoc = {
		send: function(charInfo) {
			rtc._socket.send(charInfo);
		},
		recv: function(charInfo) {
			return charInfo;
		}
	}
	charsSoc.send(JSON.stringify({
		"eventName": "get_chars",
		"data": {
			"room": room
			}
	}));

	rtc.on('receive_chars', function() {
		var data = charsSoc.recv.apply(this, arguments);
		// random character for singleplayer
		var i = Math.floor(Math.random()*data.rows.length);
		character.name = data.rows[i].name;
		character.gender = data.rows[i].gender;
		character.human = data.rows[i].human;
		character.haircolor = data.rows[i].haircolor;
		character.skincolor = data.rows[i].skincolor;
		character.glasses = data.rows[i].glasses;
		character.tv = data.rows[i].tv;
		character.author = data.rows[i].author;

		name = character.name;

		// dropdown for multiplayer
		$.each(data.rows, function(index, character) {
			$("#dropdownName").append("<option value=" + character.idcharacter + ">" + character.name + "</option>");
		});
		$("#dropdownName").change(function() {
			$("#character").val($("#dropdownName option:selected").text());
		});

	});
}
