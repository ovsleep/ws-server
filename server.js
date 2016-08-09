'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new SocketServer({ server });

var id = 0;
var clients = {};

wss.on('connection', (ws) => {
    console.log('Client connected');
    var clientId = id++;
    clients[clientId] = { 'ws': ws, data: {} };

    ws.on('message', function incoming(message) {
        var jsonMessage = JSON.parse(message);
        processMessage(jsonMessage, clientId);
    });

    ws.on('close', () => console.log('Client disconnected'));

});

setInterval(() => {
    wss.clients.forEach((client) => {
        var allData = [];
        for (var i = 0; i < id; i++) {
            allData.push(clients[i].data);
        }
        client.send(JSON.stringify(allData));
    });
}, 1000);

function processMessage(msg, id) {
    console.log(msg.value);
    switch (msg.action){
        case 'temp':
            clients[id].data.temp = msg.value;
            break;
        case 'hum':
            clients[id].data.humidity = msg.value;
            break;
    }
    clients[id].ws.send(JSON.stringify(clients[id].data));
}