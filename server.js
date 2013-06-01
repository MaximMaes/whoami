var app = require('express')();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);

var port = process.env.PORT || 8080;
server.listen(port);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/css/style.css', function(req, res) {
  res.sendfile(__dirname + '/css/style.css');
});

app.get('/js/script.js', function(req, res) {
  res.sendfile(__dirname + '/js/script.js');
});

app.get('/js/jquery-2.0.0.min.js', function(req, res) {
  res.sendfile(__dirname + '/js/jquery-2.0.0.min.js');
});

app.get('/images/debut_light.png', function(req, res) {
  res.sendfile(__dirname + '/images/debut_light.png');
});

app.get('/images/billie_holiday.png', function(req, res) {
  res.sendfile(__dirname + '/images/billie_holiday.png');
});

app.get('/js/webrtc.io.js', function(req, res) {
  res.sendfile(__dirname + '/js/webrtc.io.js');
});

var p = 1;

webRTC.rtc.on('set_ID', function(data, socket) {
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId == socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_ID",
          "data": {
            "ID": p
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
        if (p == 1) {
          p = 0;
        } else if (p == 0) {
          p = 1;
        }
      }
    }
  }
});

webRTC.rtc.on('chat_msg', function(data, socket) {
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId !== socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_chat_msg",
          "data": {
            "messages": data.messages,
            "color": data.color
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
      }
    }
  }
});

webRTC.rtc.on('set_name', function(data, socket) {
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId !== socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_name",
          "data": {
            "name": data.name
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
      }
    }
  }
});

webRTC.rtc.on('set_answer', function(data, socket) {
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId !== socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_answer",
          "data": {
            "answer": data.answer
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
      }
    }
  }
});
