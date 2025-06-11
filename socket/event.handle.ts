import { Server, Socket } from "socket.io";
import { Server as IOServer} from "socket.io";
import http from "http";
import { INotification, NotificationModel } from "../modals/notifications/notification.modal";
import mongoose from "mongoose";




// Socket.io server instance
let io: Server;
const onlineUsers = new Map<string, string>();



export const initSocket = (server: Server) => {
  io = server;

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User connected: ${userId} and socket id ${socket.id}`);
    }

    socket.on("send_message", ({ to, text }) => {
      const targetId = onlineUsers.get(to);
      if (targetId) {
        io.to(targetId).emit("new_message", { from: userId, text });
      }
    });

    socket.on("disconnect", () => {
      if (userId) onlineUsers.delete(userId);
      console.log(`❌ User disconnected: ${userId}`);
    });
  });
};

//Emit notification function
export const sendNotification = (userId: string, message: string) => {
  io.to(userId).emit("notification", {
    message,
    timestamp: new Date(),
  });
};











export const sendNotifications = async (
  toUserId: string,
  payload: {
    type: string;
    title: string;
    message: string;
    icon?: string;
    data?: any;
  }
) => {
  // Persist notification in DB
  const notif: Partial<INotification> = {
    userId: new mongoose.Types.ObjectId(toUserId),
    type: payload.type,
    message: payload.message,
    isRead: false,
  };
  await NotificationModel.create(notif);






  // Send via WebSocket if online
  const socketId = onlineUsers.get(toUserId);
  if(!socketId){
    console.log(`don't have a socketid`);
  }
  if (socketId) {
    io.to(socketId).emit("notification", payload);
  } else {
    console.log(`⚠️ User ${toUserId} offline, saved notification in DB`);
  }
};















