$(document).ready(function() {
	var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;

	init();
});


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

	var room = window.location.hash.slice(1);

	rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	rtc.on('add remote stream', function(stream, socketId) {
		console.log("ADDING REMOTE STREAM...");
		var clone = cloneVideo('oponent', socketId);
		document.getElementById(clone.id).setAttribute("class", "");
		rtc.attachStream(stream, clone.id);
	});
	rtc.on('disconnect stream', function(data) {
		console.log('remove ' + data);
		//removeVideo(data);
	});
	initNewRoom();
	//initChat();
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

function initNewRoom() {
	var button = document.getElementById("newRoom");

	button.addEventListener('click', function(event) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = '';
		for(var i = 0; i < string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum, rnum + 1);
		}

		window.location.hash = randomstring;
		location.reload();
	});
}