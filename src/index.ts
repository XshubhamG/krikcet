import "dotenv/config";
import express, { Request, Response } from "express";
import { pool } from "./db/db.js";
import matchesRouter from "./routes/matches.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use("/matches", matchesRouter);

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
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
