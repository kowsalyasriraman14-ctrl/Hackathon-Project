const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/civicshield";

  try {
    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(mongoUri, {
      dbName: "civicshield",
      serverSelectionTimeoutMS: 4000,
    });

    isConnected = true;
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn("\n⚠️ MongoDB Atlas Connection Notice:");
    console.warn(`Could not immediately reach MongoDB Atlas (${error.message}).`);
    console.warn("Reason: Current IP address might not be whitelisted in Atlas Network Access (0.0.0.0/0).");
    console.warn("CivicShield AI backend will continue running with resilient local data caching!\n");

    // Try local MongoDB as a secondary option
    try {
      console.log("Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/civicshield)...");
      const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/civicshield", {
        serverSelectionTimeoutMS: 2000,
      });
      isConnected = true;
      console.log(`Connected to local MongoDB: ${localConn.connection.host}`);
    } catch (localErr) {
      console.log("Using resilient disk-backed storage engine in backend/data/.");
      isConnected = false;
    }
  }
};

const getIsConnected = () => isConnected;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
