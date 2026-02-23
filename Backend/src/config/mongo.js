import mongoose from "mongoose";
import env from "./env.js";

let isConnected = false;

async function connectMongo(retries = 5) {
  if (isConnected) return;

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGO_URI, {
      autoIndex: false, // production safety
      maxPoolSize: 10,  // scalable connection pool
    });

    isConnected = true;

    registerMongoEvents();

  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying MongoDB connection... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, 3000));
      return connectMongo(retries - 1);
    }

    process.exit(1);
  }
}

function registerMongoEvents() {
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠ MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
}

export default connectMongo;
