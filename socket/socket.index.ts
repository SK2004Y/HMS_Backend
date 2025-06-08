require("dotenv").config();
import http from "http";
import express from "express";
import { initSocket } from "./event.handle";
import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

export const setupSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Adjust as needed
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Initialize Socket.IO
  initSocket(io);
  

  const onlineUsers = new Map<string, string>();


  // io.on("connection", (socket: Socket) => {
  //   const userId = socket.handshake.query.userId as string;

  //   if (userId) {
  //     onlineUsers.set(userId, socket.id);
  //     console.log("✅ User connected:", userId);
  //     console.log("✅ Online Users Map:", Array.from(onlineUsers.entries()));
  //   }

  //   // ✅ Listen for message and forward to recipient
  //   socket.on("send_message", ({ to, text }) => {
  //     const targetSocketId = onlineUsers.get(to);

  //     console.log(
  //       `🔁 Forwarding message from ${userId} to ${to} (socket: ${targetSocketId})`
  //     );

  //     if (targetSocketId) {
  //       io.to(targetSocketId).emit("new_message", {
  //         text,
  //         from: userId,
  //       });
  //     } else {
  //       console.log(`🚫 Target user not online or invalid ID: ${to}`);
  //     }
  //   });
   
  //   // ❌ Handle disconnect
  //   socket.on("disconnect", () => {
  //     if (userId) onlineUsers.delete(userId);
  //     console.log("❌ User disconnected:", userId);
  //   });
  // });




  server.listen(process.env.SOCKET_PORT||5000, () => {
    console.log("Socket Server is running on port 5000");
  });
};
