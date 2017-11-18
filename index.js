var express = require('express');
var http = require('http');
var socketIo = require('socket.io');

var app = express();
var httpServer = http.Server(app);

app.use(express.static(__dirname + '/public'));

httpServer.listen(3000, httpServerConnected);
function httpServerConnected(){
	console.log("Web Server started at 3000");
}

// Socket Area
var ioServer = socketIo(httpServer);
var allUsers = {};

ioServer.on('connection', ioServerConnected);
function ioServerConnected(socket){
	socket.on('custom-msg', msgReceived);
	socket.on('disconnect', socketDisconnected)
}

function msgReceived(msgData){
	var socket = this;

	if(msgData.type == 'new-user'){
		socket.broadcast.emit('custom-msg', msgData);
		socket.emit('custom-msg', {
			type: 'existing-users',
			info: Object.keys(allUsers)
		});

		allUsers[msgData.info.userName] = {};
		allUsers[msgData.info.userName].socket = socket;
	} else if(msgData.type == 'new-msg'){
		if(msgData.info.to == 'All'){
			socket.broadcast.emit('custom-msg', msgData);
		} else {
			allUsers[msgData.info.to].socket.emit('custom-msg', msgData);
		}
	}
}

function socketDisconnected(){
	console.log('User connected')
}