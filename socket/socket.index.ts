import http from "http";
import express from "express"
import initSocket from "./event.handle";
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";



 export const setupSocket = (server: HTTPServer) =>{
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as needed
    methods: ["GET", "POST"],
  },
});

// Initialize Socket.IO
initSocket(io);



server.listen(5000, () => {
  console.log("Socket Server is running on port 5000");
});
 }