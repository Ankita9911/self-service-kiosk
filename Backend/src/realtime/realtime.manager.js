import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../modules/users/user.model.js";
import Device from "../modules/devices/device.model.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

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

    if (userId) socket.join(`user:${userId}`);
    if (deviceId) socket.join(`device:${deviceId}`);
    if (outletId) socket.join(`outlet:${outletId}`);

    socket.on("join:outlet", (requestedOutletId) => {
      if (requestedOutletId) socket.join(`outlet:${requestedOutletId}`);
    });

    socket.on("leave:outlet", (requestedOutletId) => {
      if (requestedOutletId) socket.leave(`outlet:${requestedOutletId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised");
  return io;
}

export function emitOutletEvent(outletId, event, payload = {}) {
  if (!io || !outletId) return;
  io.to(`outlet:${outletId}`).emit(event, {
    outletId: String(outletId),
    ...payload,
  });
}

export function forceLogout(type, id) {
  if (!io) return;
  const room = type === "device" ? `device:${id}` : `user:${id}`;
  io.to(room).emit("force:logout");
  setTimeout(() => {
    io.in(room).disconnectSockets(true);
  }, 500);
}

export function broadcastRefresh(event) {
  if (!io) return;
  io.emit(event);
}
