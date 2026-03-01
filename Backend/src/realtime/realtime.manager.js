import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import  env  from "../config/env.js";
import User from "../modules/users/user.model.js";
import Device from "../modules/devices/device.model.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    // 1. Explicit token (device/kiosk pass it in handshake.auth)
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    // 2. Cookie (browser users after migration to httpOnly cookie)
    if (!token) {
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Live status check on connect
      if (decoded.type === "DEVICE") {
        const device = await Device.findOne({ deviceId: decoded.deviceId, isDeleted: false }).lean();
        if (!device || device.status !== "ACTIVE") {
          return next(new Error("Device inactive"));
        }
      } else if (decoded.userId) {
        const user = await User.findById(decoded.userId).lean();
        if (!user || user.isDeleted || user.status !== "ACTIVE") {
          return next(new Error("Account inactive"));
        }
      }

      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { outletId, userId, deviceId } = socket.user;

    // Tag socket so we can target it for force-logout
    if (userId) socket.join(`user:${userId}`);
    if (deviceId) socket.join(`device:${deviceId}`);

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

/**
 * Force-disconnect all sockets belonging to a user or device.
 * The client receives `force:logout` before disconnection.
 */
export function forceLogout(type, id) {
  if (!io) return;
  const room = type === "device" ? `device:${id}` : `user:${id}`;
  io.to(room).emit("force:logout");
  // Give the client a brief moment to handle the event, then kill the sockets
  setTimeout(() => {
    io.in(room).disconnectSockets(true);
  }, 500);
}

/**
 * Broadcast a named refresh event to all connected clients.
 */
export function broadcastRefresh(event) {
  if (!io) return;
  io.emit(event);
}