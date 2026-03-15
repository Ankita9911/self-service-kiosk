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
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "",

  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_S3_BUCKET: requireEnv("AWS_S3_BUCKET"),

  SQS_QUEUE_URL: requireEnv("SQS_QUEUE_URL"),

  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};

export default env;
