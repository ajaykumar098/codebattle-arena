const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problemRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const initBattleSocket = require("./socket/battleSocket");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
let isMongoConnected = false;

app.use(cors());
app.use(express.json());

const connectToMongo = async () => {
  if (!MONGO_URI) {
    console.warn("MONGO_URI not set. Running without database connection.");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    isMongoConnected = true;
    console.log("MongoDB connected successfully.");
  } catch (error) {
    isMongoConnected = false;
    console.error("MongoDB connection failed:", error.message);
  }
};

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "CodeBattle Arena API is running.",
    serverTime: new Date().toISOString(),
    dbConnected: isMongoConnected,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/dashboard", dashboardRoutes);

mongoose.connection.on("connected", () => { isMongoConnected = true; });
mongoose.connection.on("disconnected", () => { isMongoConnected = false; });

initBattleSocket(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  connectToMongo();
});