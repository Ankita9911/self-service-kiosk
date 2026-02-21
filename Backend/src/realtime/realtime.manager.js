// src/realtime/realtime.manager.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import  env  from "../config/env.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware — validate JWT and attach user/tenant info
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { outletId, role } = socket.user;

    if (outletId) {
      // Join the outlet-scoped room so broadcasts are isolated per outlet
      socket.join(`outlet:${outletId}`);
    }

    socket.on("disconnect", () => {
      // cleanup handled automatically by Socket.IO
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised");
  return io;
}