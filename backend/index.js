import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors'; // Cross-Origin Resource Sharing

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { initializeSocket } from "./socket/socket.ts";

// Creates an Express app
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// listen to the socket events
initializeSocket(server);

// Connects to MongoDB
connectDB();

// Adds middleware
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

// Defines routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Starts the HTTP server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
