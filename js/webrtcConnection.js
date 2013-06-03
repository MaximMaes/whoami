// using:
// https://github.com/webRTC/webRTC.io
// Based on:
// https://github.com/webRTC/webrtc.io-demo/

var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;

var cloneVideo = function(domId, socketId) {
	var video = document.getElementById(domId);
	var clone = video.cloneNode(false);
	clone.id = "opponent" + socketId;
	$("#videos").prepend(clone);
	videos.push(clone);
	return clone;
}

function initStream() {
	$("#invite").show();
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

	// game related
	// give user ID
	// need to use Timeout cause the websocket might not open quick enough
	setTimeout(getID, 2000);
	setTimeout(getChars, 2000);

	rtc.on('add remote stream', function(stream, socketId) {
		console.log("ADDING REMOTE STREAM...");
		var clone = cloneVideo('opponent', socketId);
		document.getElementById(clone.id).setAttribute("class", "flip");
		rtc.attachStream(stream, clone.id);
		// game related
		getNames();
		$("#invite").hide();
		$("#chatbox").show();
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