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