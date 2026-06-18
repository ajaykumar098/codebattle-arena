const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problemRoutes");

dotenv.config();

const app = express();
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

mongoose.connection.on("connected", () => {
  isMongoConnected = true;
});

mongoose.connection.on("disconnected", () => {
  isMongoConnected = false;
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  connectToMongo();
});