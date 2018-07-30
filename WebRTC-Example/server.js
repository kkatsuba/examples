const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

module.exports = server => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', function(ws) {
    console.log('connected webrtc single');

    ws.on('message', function(message) {
      console.log('received: %s', message);
      wss.broadcast(message);
    });

    ws.on('error', console.log);
  });

  wss.broadcast = function(data) {
    this.clients.forEach(function(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
};
