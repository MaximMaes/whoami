var videos = [];
var ID = 0;
var tries = 15;
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
		$("#videos").hide();
		$("#chatbox").hide();
	});

	$("#multiplayer").on('click', function(e) {
		$("#home").hide();
		$("#game").show();
		initChat();
		initStream();
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

/* general game functions */

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
	//notifyWinner();
	alert('you lose! \n You were ' + name);
}

var youWin = function() {
	alert('you win! \n You were ' + name);
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
