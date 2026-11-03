import mongoose from "mongoose";
import CareLog from "../models/CareLog.js";
import Plant from "../models/Plant.js";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === "your_actual_mongodb_atlas_connection_string") {
    throw new Error("Set a valid MONGODB_URI in server/.env.");
  }

  try {
    await mongoose.connect(uri, {
      dbName: "plantCareDB"
    });
  } catch (error) {
    if (error.code === 18 || error.codeName === "AuthenticationFailed") {
      throw new Error("MongoDB Atlas rejected authentication. Verify the database username and password in server/.env; URL-encode special characters in the password.");
    }
    throw error;
  }

  await Promise.all([Plant.createCollection(), CareLog.createCollection()]);
  console.log(`MongoDB connected: ${mongoose.connection.name}.`);
}
