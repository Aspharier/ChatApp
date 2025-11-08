require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors"); // Cross-Origin Resource Sharing

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

// Creates an Express app
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

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
