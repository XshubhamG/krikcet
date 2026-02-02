import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { Match } from "../db/schema";

function sendJSONMessage(ws: WebSocket, payload: object) {
  if (ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify(payload));
}

function broadcastMessage(wss: WebSocketServer, payload: object) {
  wss.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return;

    client.send(JSON.stringify(payload));
  });
}

export function attachWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    sendJSONMessage(socket, {
      type: "welcome",
      message: "Welcome to the websocket server",
    });
    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match: Match) {
    broadcastMessage(wss, {
      type: "match_created",
      data: match,
    });
  }

  return {
    broadcastMatchCreated,
  };
}
