import { Request, Response, NextFunction } from "express";
import { AppointmentModel } from "../modals/appointment.model";
import { PatientModel } from "../modals/patient.model";
import { AvailabilityModel } from "../modals/availability.model";
import  ErrorHandler  from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { DoctorModel } from "../modals/doctor.model";
import { ErrorMiddleware } from "../middleware/error";
import { autoReschedule } from "../utils/scheduleHelper";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import userModel from "../modals/user_model";


//createappointment for single date and time 
// export const createAppointment = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { patientId, doctorId, date, time, reason } = req.body;

//     // 🧠 Combine date and time into one ISO string, then into Date object
//     const appointmentDate = new Date(`${date}T${time}`);

//     // queueNumber logic can be custom or static for now
//     const queueNumber =
//       (await AppointmentModel.countDocuments({ appointmentDate })) + 1;

//     const appointment = await AppointmentModel.create({
//       patient: patientId,
//       doctor: doctorId,
//       appointmentDate,
//       reason,
//       status: "pending",
//       queueNumber,
//     });

//     res.status(201).json({
//       success: true,
//       message: "appointment successfully created ",
//       appointment,
//     });
//   }
// );






export const createAppointment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, doctorId, date, time, reason,isConfirmed } = req.body;

    const appointmentDate = new Date(`${date}T${time}`);

    const queueNumber =
      (await AppointmentModel.countDocuments({ appointmentDate })) + 1;

    const appointment = await AppointmentModel.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      appointmentTime: time,
      reason,
      status: "pending",
      queueNumber,
    });

    console.log(`appointment data is `,appointment);

    // Fetch doctor & patient info
    // const doctor = await DoctorModel.findById(doctorId);
    // const patient = await PatientModel.findById(patientId);
 

const doctor = await DoctorModel.findById(doctorId);
const patient = await PatientModel.findById(patientId);
// console.log(`patient_email is ${patient_id.email}`);
console.log(`patient_email is `,patient);

const userid=patient?.userId;

const users=await userModel.findById(userid);

console.log(`userid is `,userid);

if (!doctor || !patient) {
  return next(new ErrorHandler("Doctor or Patient not found", 404));
}


      const data = {
        patientName: patient.name,
        doctorName: doctor.name,
        appointmentDate: appointmentDate.toDateString(),
        time,
        reason,
        isConfirmed,
        rejectionReason: appointment.reason || "Not specified",
        appointmentLink: "https//google.com",
        status: "confirmed",
      };

    
   
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/appointment-mail.ejs"),
        data
      );

      console.log(`useremail is ${users?.email}`);

     
      await sendMail({
  email: users.email,
  subject: "Appointment Confirmation Details",
  text: "Appointment Scheduled", // ✅ VALID
  template: "appointment-mail.ejs",
  data,

      });
      console.log(`patient_email is ${patient.email}`);
    

    res.status(201).json({
      success: true,
      message: "Appointment successfully created",
      appointment,
    });
  }
);





//create multiple appointment date and time like array 
export const createMultipleAppointments = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, doctorId, appointments, reason } = req.body;

    if (!Array.isArray(appointments) || appointments.length === 0) {
      return next(new ErrorHandler("Appointments array is required", 400));
    }

    const createdAppointments = [];
    const conflicts = [];

    for (const slot of appointments) {
      const { date, time } = slot;

      if (!date || !time) {
        conflicts.push({ date, time, reason: "Missing date or time" });
        continue;
      }

      const appointmentDate = new Date(`${date}T${time}`);

      const conflict = await AppointmentModel.findOne({
        doctor: doctorId,
        appointmentDate,
      });

      if (conflict) {
        conflicts.push({ date, time, reason: "Doctor already booked" });
        continue;
      }

      const queueNumber =
        (await AppointmentModel.countDocuments({ appointmentDate })) + 1;

      const newAppointment = await AppointmentModel.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate,
        reason,
        status: "pending",
        queueNumber,
      });

      createdAppointments.push(newAppointment);
    }

    res.status(207).json({
      success: true,
      message: "Some appointments may have failed",
      createdAppointments,
      conflicts,
    });
  }
);



export const getAppointmentsByPatient = CatchAsyncError(
  async (req: Request, res: Response,next:NextFunction) => {

    try {
      const { patientId } = req.params;
      console.log(`patient id is ${patientId}`);
      const appointments = await AppointmentModel.find({
        patient: patientId,
      }).populate("doctor");

      res.status(200).json({
        success: true,
       
        appointments,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }

  }
);

export const updateAppointmentStatus = CatchAsyncError(
  async (req: Request, res: Response) => {

    const id = req.params.id;
    
    const { status } = req.body;
        console.log("Updating appointment with ID:", id);

    const appointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }




    res.status(200).json({
      success: true,
      message: "appointment updated successfully",
      appointment,
    });
  }
);


// 2. Get all appointments
export const getAllAppointments = CatchAsyncError(
  async (_req: Request, res: Response) => {
    const appointments = await AppointmentModel.find()
      .populate("patient", "name age gender")
      .populate("doctor", "name specialization");


      

    res.status(200).json({
      success: true,
      message: "all appointment ",

      appointmentCount: appointments.length,
      appointments,
    });
  }
);

// 3. Cancel an appointment
export const cancelAppointment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const  appointmentId = req.params.id;

    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled",
      appointment,
    });
  }
);


// function data(err: Error | null, str: string): unknown {
//   throw new Error("Function not implemented.");
// }

