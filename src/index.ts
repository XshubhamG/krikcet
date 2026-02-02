import "dotenv/config";
import express, { Request, Response } from "express";
import { pool } from "./db/db.js";
import matchesRouter from "./routes/matches.route.js";
import { createServer } from "http";
import { attachWebSocketServer } from "./ws/server.js";

const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());

app.use("/matches", matchesRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Kircket API!" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  server.close();
  await pool.end();
  process.exit(0);
});

// Start server
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(
    `WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`
  );
});
