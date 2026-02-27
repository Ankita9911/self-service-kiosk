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

    // Auto-join for device tokens (kiosk) that have outletId in JWT
    if (outletId) {
      socket.join(`outlet:${outletId}`);
    }

    // Admin users (FRANCHISE_ADMIN, SUPER_ADMIN) have no outletId in JWT
    // so they explicitly request the room for the outlet they are viewing
    socket.on("join:outlet", (requestedOutletId) => {
      if (requestedOutletId) {
        socket.join(`outlet:${requestedOutletId}`);
      }
    });

    socket.on("leave:outlet", (requestedOutletId) => {
      if (requestedOutletId) {
        socket.leave(`outlet:${requestedOutletId}`);
      }
    });

    socket.on("disconnect", () => {
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised");
  return io;
}