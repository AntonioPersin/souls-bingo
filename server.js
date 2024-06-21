const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let bingoCardState = Array(25).fill('');
let twoHourTime = 7200; // 2 hours in seconds
let fiveMinuteTime = 300; // 5 minutes in seconds
let twoHourInterval;
let fiveMinuteInterval;

io.on('connection', (socket) => {
    socket.emit('initialize', {
        bingoCardState,
        twoHourTime,
        fiveMinuteTime
    });

    socket.on('markCell', (data) => {
        bingoCardState[data.index] = data.color;
        io.emit('cellMarked', data);
    });

    socket.on('startTwoHourTimer', () => {
        if (!twoHourInterval) {
            twoHourInterval = setInterval(() => {
                if (twoHourTime > 0) {
                    twoHourTime--;
                    io.emit('updateTwoHourTimer', twoHourTime);
                } else {
                    clearInterval(twoHourInterval);
                    twoHourInterval = null;
                }
            }, 1000);
        }
    });

    socket.on('pauseTwoHourTimer', () => {
        clearInterval(twoHourInterval);
        twoHourInterval = null;
    });

    socket.on('resetTwoHourTimer', () => {
        clearInterval(twoHourInterval);
        twoHourInterval = null;
        twoHourTime = 7200;
        io.emit('updateTwoHourTimer', twoHourTime);
    });

    socket.on('startFiveMinuteTimer', () => {
        if (!fiveMinuteInterval) {
            fiveMinuteInterval = setInterval(() => {
                if (fiveMinuteTime > 0) {
                    fiveMinuteTime--;
                    io.emit('updateFiveMinuteTimer', fiveMinuteTime);
                } else {
                    clearInterval(fiveMinuteInterval);
                    fiveMinuteInterval = null;
                }
            }, 1000);
        }
    });

    socket.on('pauseFiveMinuteTimer', () => {
        clearInterval(fiveMinuteInterval);
        fiveMinuteInterval = null;
    });

    socket.on('resetFiveMinuteTimer', () => {
        clearInterval(fiveMinuteInterval);
        fiveMinuteInterval = null;
        fiveMinuteTime = 300;
        io.emit('updateFiveMinuteTimer', fiveMinuteTime);
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
