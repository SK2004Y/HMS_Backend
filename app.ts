require('dotenv').config();
import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
// import exp from 'constants';
import { Request,Response,NextFunction } from 'express';
import {ErrorMiddleware} from './middleware/error';
import userRouter from './routes/user.route';
import doctorRouter from './routes/doctor.route'
import patientRouter from './routes/patient.route';
import { appointmentRouter } from './routes/appointment.route';
// import orderRouter from './routes/order.route';
import notificationRoute from './routes/notification.route';
import { reportRouter } from './routes/patient-report.router';
// import layoutRouter from './routes/layout.route';
import { setupSocket } from './socket/socket.index';  //socket io intializing
import http from "http"
import { availabilityRouter } from './routes/availability.route';


import reports from './routes/reports/doctor-report.route';


import diaRouter from './routes/diagnostic.route';

import GymRoute from './routes/gym/gym.route';
import diagnosisRouter from './routes/diagnosis/diagnosis.route';
import HospitalRoute from './routes/hospital/hospital.route';
import MedicineRoute from './routes/medicine/medicine.route';
import AmbulanceRoute from './routes/ambulance/ambulance.route';
import RadiologyRoute from './routes/radiology/radiology.router';
import ResortRoute from './routes/resort/resort.route';
import PatientRouter from './routes/patient/patient.router';
import ClinicRoute from './routes/clinic/clinic.route';
import dashboardRouter from './routes/dashboard/provide.route';

// import { reportRouter } from './routes/patient-report.router';


export const app = express();


//creating socket server
const server =http.createServer(app);

//initialize the socket.io for chat and video calling
setupSocket(server)


//body parser
app.use(express.json({limit:"500mb"}));


//cookie parser
app.use(cookieParser());

app.set('trust proxy', 1);


// cors == cross origin resource sharing


app.use(
  cors({
    // origin:process.env.ORIGIN
    //fronted part running port url
    origin: [
      
      "https://www.uronhealth.in",
      "https://www.provideruron.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.25.191:3000",
      "http://192.168.199.191:3000",
      "http://192.168.31.253:3000",
    ],

    credentials: true,
  })
);




//routes

app.use("/api/vs",userRouter);
app.use("/api/vs",doctorRouter);
app.use("/api/vs",PatientRouter);
app.use("/api/vs/patient",reportRouter);
app.use("/api/vs/doctor", reports);
app.use("/api/vs/appointment",appointmentRouter)
app.use("/api/vs/availability",availabilityRouter);


// app.use("/api/vs",orderRouter);
app.use("/api/vs",notificationRoute);
// app.use("/api/vs/",layoutRouter);


app.use("/api/vs/diagnostic",diaRouter)

app.use("/api/vs/gym",GymRoute);
app.use("/api/vs/diagnosis",diagnosisRouter)
app.use("/api/vs/hospital",HospitalRoute);
app.use("/api/vs/medicine",MedicineRoute);
app.use("/api/vs/ambulance",AmbulanceRoute);
app.use("/api/vs/radiology",RadiologyRoute);
app.use("/api/vs/resort",ResortRoute);
app.use("/api/vs/clinic",ClinicRoute);
app.use("/api/vs/dashboard",dashboardRouter);



//testing route
app.get("/test",(req: Request ,res: Response ,next: NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"Api is Working",
    });
});


//all route

app.all("*",(req: Request,res: Response,next: NextFunction)=>{
    const err=new Error(`Route ${req.originalUrl}not found`) as any;
    err.statusCode=404;
    next(err);
});



//error handler uses

app.use(ErrorMiddleware);


