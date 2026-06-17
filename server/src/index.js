const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

app.use(cors());
app.use(express.json());

const connectToMongo = async () => {
  if (!MONGO_URI) {
    console.warn("MONGO_URI not set. Running without database connection.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  res.status(200).json({
    message: "CodeBattle Arena API is running.",
    serverTime: new Date().toISOString(),
    dbConnected: isDbConnected,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  connectToMongo();
});
