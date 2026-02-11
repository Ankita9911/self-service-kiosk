import dotenv from "dotenv";

dotenv.config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  MONGO_URI: requireEnv("MONGO_URI"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
};

export default env;
