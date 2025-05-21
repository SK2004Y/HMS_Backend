// import { CatchAsyncError } from "../middleware/catchAsyncErrors";
// import { AppointmentModel } from "../modals/appointment.model";
// import express ,{Request,Response,NextFunction} from "express"
// import reviewModel from "../modals/review.model";


// export const getreview = CatchAsyncError(
//   async (_req: Request, res: Response) => {
//     try {
//     const { doctorId, patientId, rating, comment } = req.body;

//     const newReview = await review.create({
//       doctorId,
//       patientId,
//       rating,
//       comment
//     });

//     res.status(201).json({ message: 'Review submitted successfully', review: newReview });
//   } catch (err) {
//     console.error('Submit review error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }
// );
