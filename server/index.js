const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const gameLogic = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('client'));

wss.on('connection', (ws) => {
  console.log('New client connected');
  gameLogic.initializeGame();

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      const result = gameLogic.processMove(data);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(result));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server is listening on port 8000');
});
