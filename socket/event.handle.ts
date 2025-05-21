import { Server, Socket } from "socket.io";
import { Server as IOServer} from "socket.io";
import http from "http";


//globally declare to use it all files
let ioInstance: Server;
const connectedUsers = new Map<string, Socket>();
export const initSocket = (io: Server) => {
    ioInstance=io;
  io.on("connection", (socket: Socket) => {
    console.log("New user connected:", socket.id);

    // Save user with their ID (you can use JWT token for verification)
    socket.on("register", (userId: string) => {
      connectedUsers.set(userId, socket);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Message notification
    socket.on("send_message", (data) => {
      const { receiverId, message } = data;
      const receiverSocket = connectedUsers.get(receiverId);
      if (receiverSocket) {
        receiverSocket.emit("receive_message", {
          senderId: socket.id,
          message,
        });
      }
    });

    // Appointment request
    socket.on("appointment_request", ({ doctorId, appointmentInfo }) => {
      const doctorSocket = connectedUsers.get(doctorId);
      if (doctorSocket) {
        doctorSocket.emit("new_appointment", appointmentInfo);
      }
    });

    // WebRTC signaling
    socket.on("call_user", ({ userToCall, signalData, from, name }) => {
      const userSocket = connectedUsers.get(userToCall);
      if (userSocket) {
        userSocket.emit("call_incoming", { signal: signalData, from, name });
      }
    });

    socket.on("answer_call", ({ to, signal }) => {
      const userSocket = connectedUsers.get(to);
      if (userSocket) {
        userSocket.emit("call_answered", { signal });
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, userSocket] of connectedUsers.entries()) {
        if (userSocket.id === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });
};



// Expose helper to send events from anywhere
export const notifyUserById = (userId: string, event: string, payload: any) => {
  const userSocket = connectedUsers.get(userId);
  if (userSocket) {
    userSocket.emit(event, payload);
  }
};

export default initSocket;



