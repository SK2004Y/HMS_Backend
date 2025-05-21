// import { Server } from "socket.io";
// import { Server as HTTPServer } from "http";
// import { DoctorModel} from "./modals/doctor.model"; // adjust path as per your project

// export const setupSocket = (server: HTTPServer) => {


//   // const socket = io("http://localhost:8000");
//   const io = new Server(server, {
//     cors: {
//       origin: "*", // update this with frontend domain in production
//       methods: ["GET", "POST"],
//     },

   
//   });

//   io.on("connection", (socket) => {
//     console.log("A doctor connected:", socket.id);

//     // Doctor registration
//     socket.on("registerDoctor", async (doctorId: string) => {
//       await DoctorModel.findByIdAndUpdate(doctorId, {
//         socketId: socket.id,
//         onlineStatus: true,
//       });
//       console.log(` Doctor ${doctorId} registered and online`);
//     });

//     // Doctor disconnection
//     socket.on("disconnect", async () => {
//       await DoctorModel.findOneAndUpdate(
//         { socketId: socket.id },
//         {
//           onlineStatus: false,
//           socketId: null,
//           lastseen: new Date(), // ⏱️ Save last seen timestamp
//         }
//       );
//       console.log("🔴 A doctor disconnected:", socket.id);
//     });
//   });

//   return io;
// };
