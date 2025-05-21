import { Request, Response, NextFunction } from "express";
import { AppointmentModel } from "../../modals/chats/appointment.chat";
import { sendResponse } from "../../utils/chats/sendResopnse.chat"

import { notifyUserById } from "../../socket/event.handle";

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  const data=req.body;
    console.log(`hitting appointments creating`,req.body)
    const appointment = await AppointmentModel.create(req.body);

    // Notify doctor (assuming req.body.doctorId exists)
    const doctorId = req.body.doctor;
    if (doctorId) {
      notifyUserById(doctorId, "new_appointment", appointment);
    }

    sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Appointment request sent to doctor",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};







// {
//   "specialization": ["Cardiologist", "General Physician"],
//   "registrationNumber": "DOC1234567",
//   "experience": 8,
//   "gstNumber": "22AAAAA0000A1Z5",
//   "licenceNumber": "LIC12345",
//   "gender": "Male",
//   "address": "123, Health Street, Medical City",
//   "location": {
//     "type": "Point",
//     "coordinates": [77.5946, 12.9716],
//     "city": "Bangalore",
//     "state": "Karnataka",
//     "pincode": "560001",
//     "address": "123, Health Street, Medical City",
//     "landmark": "Near City Hospital"
//   },
//   "avatar": {
//     "url": "https://example.com/avatar.jpg",
//     "public_id": "avatar123"
//   }
// }






