import { Request, Response, NextFunction } from "express";
import { DoctorModel } from "../modals/doctor.model";
import { DoctorProfile } from "../modals/doctor.modal/profile.modal";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary, { streamUploadToCloudinary } from "../utils/cloudinary";
import { messagess } from "./reports/doctor-report.controller";

// Create doctor profile
// export const createDoctorProfile = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log(`api hit create`);
//       console.log("Request Body: ", req.body);
//       console.log("File: ", req.file);

//       let avatarData = {
//         secure_url: "",
//         public_id: "",
//       };


//       // Step 1: Upload avatar to Cloudinary if a file is present
//       if (req.file) {
//         console.log(`file get form frontend`,req.file);
//         avatarData = await streamUploadToCloudinary(req.file, "doctor-avatars");
//         console.log("Uploaded to Cloudinary:", avatarData);
//       }


//       const parsedBody = {
//         ...req.body,
//         location: JSON.parse(req.body.location),
//         accountDetails: JSON.parse(JSON.stringify(req.body.accountDetails)), // this step ensures it's a clean object
//       };
//       // Step 2: Create new doctor profile with avatar info (if available)
//       const doctor = new DoctorProfile({
//         ...parsedBody,
//         avatar: {
//           url: avatarData.secure_url,
//           public_id: avatarData.public_id,
//         },
//       });

//       // Step 3: Save doctor profile to MongoDB
//       await doctor.save();

//       // Step 4: Respond with success and created profile
//       res.status(201).json({ success: true, doctor ,messages:"profile Created succesfully"});
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );



export const createDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("API hit: createDoctorProfile");
      console.log("Request Body:", req.body);
      console.log("File:", req.file);

      let avatarData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        avatarData = await streamUploadToCloudinary(req.file, "doctor-avatars");
      }
      let location = {};
      let accountDetails = {};

      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location data" });
      }

      try {
        accountDetails = JSON.parse(req.body.accountDetails);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid account details data" });
      }
      
      const parsedBody = {
        ...req.body,
        location,
        accountDetails,
      };
      const existingProfile = await DoctorProfile.findOne({
        userId: req.body.userId,
      });
      if (existingProfile) {
        return res
          .status(400)
          .json({ message: "Profile already exists for this user." });
      }
      const doctor = new DoctorProfile({
        ...parsedBody,
        avatar: {
          url: avatarData.secure_url,
          public_id: avatarData.public_id,
        },
      });

      await doctor.save();

      res.status(201).json({
        success: true,
        doctor,
        message: "Profile created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const allDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      

      const doctor=await DoctorProfile.find();
      const len=doctor.length;
     

      // Step 3: Save doctor profile to MongoDB
    

      // Step 4: Respond with success and created profile
      res.status(201).json({ success: true,messagess:"total doctors are ",len, doctor });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


export const singleDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id=req.params.id
      console.log(`doctoridis `,id)
      const doctor = await DoctorProfile.findById(id);


      // Step 3: Save doctor profile to MongoDB

      // Step 4: Respond with success and created profile
      res
        .status(201)
        .json({ success: true, messagess: "Single doctor profile", doctor });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Controller to update doctor profile and optionally replace avatar
export const updateDoctorProfiles = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.params.id;
      const files=req.file;
      console.log(`fileis `,files)

      // Step 1: Find the existing doctor profile
      const existingDoctor = await DoctorProfile.findById(doctorId);
      if (!existingDoctor) {
        return next(new ErrorHandler("Doctor not found", 404));
      }

      // Step 2: Prepare updated avatar data
      let newAvatar = existingDoctor.avatar; // Default to existing avatar

      if (req.file) {
        // Step 3: Upload new avatar to Cloudinary
        const uploadedAvatar = await streamUploadToCloudinary(
          req.file,
          "doctor-avatars"
        );

        // Step 4: Delete old avatar from Cloudinary (if exists)
        if (existingDoctor.avatar?.public_id) {
          await deleteFromCloudinary(existingDoctor.avatar.public_id);
        }

        // Step 5: Set new avatar data
        newAvatar = {
          url: uploadedAvatar.secure_url,
          public_id: uploadedAvatar.public_id,
        };
      }

      // Step 6: Update doctor profile
      const updatedDoctor = await DoctorProfile.findByIdAndUpdate(
        doctorId,
        {
          ...req.body,
          avatar: newAvatar,
        },
        { new: true, runValidators: true }
      );

      // Step 7: Return updated profile
      res.status(200).json({ success: true, doctor: updatedDoctor });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);




export const deleteDoctorProfiles = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const Id = req.params.id;

      const doctor = await DoctorProfile.findByIdAndDelete(Id);
      if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

      res.status(200).json({
        success: true,
        message: "Doctor profile deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Create doctor profile

interface data{
  
}
export const createDoctorProfiles = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
     try {
      console.log(req.body);
       const doctor = new DoctorModel(req.body);
       console.log(`data is `,doctor);
       await doctor.save();
       res.status(201).json({ success: true, doctor });
     } catch (error: any) {
       return next(new ErrorHandler(error.message, 400));
     }
  }
);





//update doctor profile 

export const updateDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try{
    const doctorId = req.params.id;
    const updateData = req.body;




    if (updateData.qualificationss) {
      for (const q of updateData.qualificationss) {
        if (q.certificate && Array.isArray(q.certificate)) {
          const uploadedCerts = await Promise.all(
            q.certificate.map((cert: string) =>
              cloudinary.uploader.upload(cert, {
                folder: "doctor_certificates",
              })
            )
          );
          q.certificate = uploadedCerts.map((u) => u.secure_url);
        }
      }
    }


    const doctor = await DoctorModel.findByIdAndUpdate(doctorId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

    res.status(200).json({ success: true, doctor });


  }
   catch(error:any){
      return next(new ErrorHandler(error.message,400));
    }
  }
);







// Get doctor profile
export const getDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try{
    const doctorId = req.params.id;
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

    res.status(200).json({ success: true, doctor });

    }
     catch(error:any){
        return next(new ErrorHandler(error.message,400));
      }
  }
);


//get all doctors 
export const getAllDoctors = CatchAsyncError(
  async (req: Request, res: Response,next:NextFunction) => {

    try {
      const doctors = await DoctorModel.find();
       const doctorCount = doctors.length;
      res.status(200).json({ success: true, doctors ,doctorCount});
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



//search/filtter doctors by specalization or name 
export const searchDoctors = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        specialization,
        languages,
        minFee,
        maxFee,
        minRating,
        sortBy,
        order,
      } = req.query;

      const query: any = {};

      // 1️⃣ Name and Specialization Filter (Regex + Multi)
      if (name) {
        query.name = { $regex: name, $options: "i" };
      }

      if (specialization) {
        const specsArray = (specialization as string).split(",");
        query.specialization = { $in: specsArray };
      }

      // 2️⃣ Language Filter (Assuming doctor.languages is array)
      if (languages) {
        const langArray = (languages as string).split(",");
        query.languages = { $in: langArray };
      }

      // 3️⃣ Consulting Fee Filter
      if (minFee || maxFee) {
        query.consultingFee = {};
        if (minFee) query.consultingFee.$gte = Number(minFee);
        if (maxFee) query.consultingFee.$lte = Number(maxFee);
      }

      // 4️⃣ Rating Filter
      if (minRating) {
        query.rating = { $gte: Number(minRating) };
      }

      // 5️⃣ Sorting (e.g., sort by fee or rating)
      let sortQuery: any = {};
      if (sortBy) {
        const sortField = sortBy as string;
        const sortOrder = order === "desc" ? -1 : 1;
        sortQuery[sortField] = sortOrder;
      }

      console.log("Final Query: ", query);
      console.log("Sort By: ", sortQuery);

      const doctors = await DoctorModel.find(query).sort(sortQuery);
      res.status(200).json({
        success: true,
        count: doctors.length,
        doctors,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);








//toogle for the active and inactive
export const toggleAvailability = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.params.id;
      const doctor = await DoctorModel.findById(doctorId);
      if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

      doctor.isAvailable = !doctor.isAvailable;
      await doctor.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: `Doctor ${doctor.name} (${doctor._id}) is now ${
          doctor.isAvailable ? "available" : "unavailable"
        }`,
        doctorId: doctor._id,
        isAvailable: doctor.isAvailable,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//approve doctor by the admin
export const approveDoctor = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.id;

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

    doctor.isApproved = true;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
      doctor,
    });
  }
);




//delete doctor profile 
export const deleteDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const doctorId = req.params.id;

      const doctor = await DoctorModel.findByIdAndDelete(doctorId);
      if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

      res
        .status(200)
        .json({
          success: true,
          message: "Doctor profile deleted successfully",
        });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//communication bia chat/video call between patient and doctor 
export const toggleCommunication = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.id;
    const { videoCallEnabled, chatEnabled } = req.body;

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

    if (videoCallEnabled !== undefined)
      doctor.videoCallEnabled = videoCallEnabled;

    if (chatEnabled !== undefined) doctor.chatEnabled = chatEnabled;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Communication preferences updated",
      doctor,
    });
  }
);


// 4. doctor Stats (count by city & approval)
export const getDoctorStats = CatchAsyncError(async (_req: Request, res: Response) => {
  const total       = await DoctorModel.countDocuments();
  const approved = await DoctorModel.countDocuments({ isApproved: true });
  const pending = await DoctorModel.countDocuments({ isApproved: false });
  const byCity = await DoctorModel.aggregate([
    { $group: { _id: "$location.city", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: { total, approved, pending, byCity }
  });
});





//review controllers

export const addOrUpdateDoctorReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const { userId, userType, rating, comment } = req.body;

    if (!userId || !userType || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    // const existingReviewIndex = review.reviews.findIndex(
    //   (r: any) => r.userId.toString() === userId && r.userType === userType
    // );
const existingReviewIndex = doctor.reviews.findIndex(
  (r: any) => r.userId?.toString() === userId && r.userType === userType
);
    if (existingReviewIndex !== -1) {
      doctor.reviews[existingReviewIndex].rating = rating;
      doctor.reviews[existingReviewIndex].comment = comment;
    } else {
      doctor.reviews.push({ userId, userType, rating, comment });
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Review saved successfully",
      reviews: doctor.reviews,
    });
  }
);


export const getDoctorReviews = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { doctorId } = req.params;


    const doctor = await DoctorModel.findById(doctorId).populate(
      "reviews.userId",
      "name"
    );
 

    const total = doctor?.reviews?.length;
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    res.status(200).json({ success: true, total, reviews: doctor.reviews });
  }
);


export const deleteDoctorReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { doctorId, userId, userType } = req.params;

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    doctor.reviews = doctor.reviews.filter(
      (r: any) => !(r.userId.toString() === userId && r.userType === userType)
    );

    await doctor.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  }
);