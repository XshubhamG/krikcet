import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { Match } from "../db/schema";

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

function sendJSONMessage(ws: WebSocket, payload: object) {
  if (ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify(payload));
}

function broadcastMessage(wss: WebSocketServer, payload: object) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

export function attachWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket: ExtendedWebSocket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJSONMessage(socket, {
      type: "welcome",
      message: "Welcome to the websocket server",
    });
    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if ((client as ExtendedWebSocket).isAlive === false)
        return client.terminate();
      (client as ExtendedWebSocket).isAlive = false;
      (client as ExtendedWebSocket).ping();
    });
  }, 30000);
  wss.on("close", () => {
    clearInterval(interval);
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
