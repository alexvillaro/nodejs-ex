var port = 80;

console.log('Klar');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var roomMembers = {

};

app.get('/', function (req, res) {
    res.send('Denne IP-adresse er dedikeret som MATADORâ„¢ server');
});

io.sockets.on('connection', function (socket) {
    console.log('+');
    var room = false;
    var nr = false;
    var starter = false;
    var i;
    var j;
    var connectionsRequired = 0;

    socket.emit('connected');

    socket.on('disconnect', function () {
        console.log('-');
        socket.broadcast.to(room).emit('leaved', nr, starter);
        if (room !== false) {
            roomMembers[room] -= 1;
            if (roomMembers[room] <= 0 || isNaN(roomMembers[room])) {
                delete roomMembers[room];
            }
        }
    });

    socket.on('joinRoom', function (roomname, starterData, nrData) {
        if (room) {
            if (roomMembers[room]) {
                roomMembers[room] -= 1;
            }
        }
        if (!!nrData) {
            socket.join(roomname);
            room = roomname;
            if (roomMembers[room]) {
                roomMembers[room] += 1;
            } else {
                roomMembers[room] = 1;
            }
            nr = nrData;
            if (starterData) {
                starter = true;
                socket.emit('joinConfirm', true);
                socket.to(room + 'waitinglist').emit('joinNow');
            } else {
                if (roomMembers[roomname] > 0) {
                    socket.broadcast.to(room).emit('joined', nr);
                    socket.emit('joinConfirm', true);
                } else {
                    socket.join(roomname + 'waitinglist');
                    socket.emit('joinConfirm', false);
                }
            }
        } else {
            socket.join(roomname);
            room = roomname;
            if (roomMembers[room]) {
                roomMembers[room] += 1;
            } else {
                roomMembers[room] = 1;
            }
            if (starterData) {
                starter = true;
            }
            socket.emit('joinConfirm', true);
            if (nrData) {
                nr = nrData;
                socket.broadcast.to(room).emit('joined', nr);
            }
        }
    });

    socket.on('updateCurrentConnections', function (a, b, c) {
        socket.broadcast.to(room).emit('updateCurrentConnections', a, b, c);
    });

    socket.on('groupMessage', function (data) {
        socket.broadcast.to(room).emit('groupMessage', data);
    });

    socket.on('join', function (data) {
        if (roomMembers[data]) {
            socket.emit('joinCheckConfirm', true);
        } else {
            socket.emit('joinCheckConfirm', false);
        }
    });
    socket.on('getData', function () {
        socket.broadcast.to(room).emit('getData');
    });
    socket.on('sendData', function (data, gameReadyData) {
        var gameReady = false;
        if (gameReadyData) {
            gameReady = true;
        }
        socket.broadcast.to(room).emit('sendData', data, gameReady);
    });
    socket.on('ledigt', function (data) {
        if (roomMembers[data]) {
            socket.emit('ledigtConfirm', false);
        } else {
            socket.emit('ledigtConfirm', true);
        }
    });
    socket.on('cancel', function () {
        socket.broadcast.to(room).emit('cancel');
    });
    socket.on('bilvis', function (data) {
        nr = data;
        socket.broadcast.to(room).emit('bilvis', data);
    });
    socket.on('uncheck', function (data) {
        socket.broadcast.to(room).emit('uncheck', data);
    });
    socket.on('check', function (data) {
        nr = data;
        socket.broadcast.to(room).emit('check', data);
    });
    socket.on('confirm', function (data) {
        starter = false;
        delete roomMembers[room];
        socket.broadcast.to(room).emit('confirm', data);
        socket.emit('confirmCallback');
    });

    socket.on('reload', function () {
        socket.broadcast.to(room).emit('reload');
    });
});

setInterval(function () {
    console.log(roomMembers);
}, 1000);

http.listen(port, function () {
    console.log('Server startet pÃ¥ port ' + port);
});

/*
Denne fil er udviklet, vedligeholdt og ejet af Alex Villaro KrÃ¼ger
*/
