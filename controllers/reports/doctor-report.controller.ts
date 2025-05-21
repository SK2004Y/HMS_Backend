import { deleteFromCloudinary, streamUploadToCloudinary, uploadToCloudinary } from "../../utils/cloudinary";
import { DoctorModel } from "../../modals/doctor.model";
import { Request, Response, NextFunction } from "express";
require("dotenv").config();

import twilio from "twilio";


interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export const uploadDoctorGallery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Uploading publication cover pages...");

    const { doctorId } = req.params; // Assuming route is /upload/:id
    console.log("doctorId:", doctorId);

    const files = req.files as Express.Multer.File[]; // Type assertion

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    // Find the doctor by ID
    const doctor = await DoctorModel.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // Upload each file to Cloudinary
    const urls: CloudinaryResponse[] = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file.buffer, "doctor/publication-coverpage")
      )
    );

    console.log("Cloudinary URLs:", urls);

    // Update coverPages of each publication
    doctor.publications.forEach((publication, index) => {
      doctor.publications[index].coverPages = [
        ...(publication.coverPages || []),
        ...urls.map((urlData) => ({
          url: urlData.secure_url,
          public_id: urlData.public_id,
        })),
      ];
    });

    // Save the updated doctor document
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Publication cover pages uploaded successfully",
      certificates: urls,
    });
  } catch (error: any) {
    console.error("Upload error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// PUT /doctor/:id/publication/:pubIndex/coverpage/:imgIndex
export const updateCoverPageImage = async (
  req: Request,
  res: Response
) => {
  try {
    const { doctorId, pubIndex, imgIndex } = req.params;
    const file = req.file as Express.Multer.File;


    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const publication = doctor.publications[parseInt(pubIndex)];
    if (!publication || !publication.coverPages[parseInt(imgIndex)]) {
      return res.status(404).json({ success: false, message: "CoverPage not found" });
    }

    // Delete existing image from Cloudinary
    const oldImg = publication.coverPages[parseInt(imgIndex)];
    await deleteFromCloudinary(oldImg.public_id);

    // Upload new image
    const newImg = await uploadToCloudinary(file.buffer, "doctor/publication-coverpage");

    // Update in MongoDB
    publication.coverPages[parseInt(imgIndex)] = {
      url: newImg.secure_url,
      public_id: newImg.public_id,
    };

    await doctor.save();
    return res.status(200).json({ success: true, message: "Cover page updated" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /doctor/:id/publication/:pubIndex/coverpage/:imgIndex
export const deleteCoverPageImage = async (
  req: Request,
  res: Response
) => {
  try {
    const { doctorId, pubIndex, imgIndex } = req.params;

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const publication = doctor.publications[parseInt(pubIndex)];
    if (!publication || !publication.coverPages[parseInt(imgIndex)]) {
      return res.status(404).json({ success: false, message: "CoverPage not found" });
    }

    const imageToDelete = publication.coverPages[parseInt(imgIndex)];

    // Delete from Cloudinary
    await deleteFromCloudinary(imageToDelete.public_id);

    // Remove from MongoDB
    publication.coverPages.splice(parseInt(imgIndex), 1);

    await doctor.save();
    return res.status(200).json({ success: true, message: "Cover page deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




export const uploadDoctorRewardPicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Uploading rewards cover pages...");

    const { doctorId } = req.params; // Assuming route is /upload/:id
    console.log("doctorId:", doctorId);

    const files = req.files as Express.Multer.File[]; // Type assertion

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    // Find the doctor by ID
    const doctor = await DoctorModel.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // Upload each file to Cloudinary
    const urls: CloudinaryResponse[] = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file.buffer, "doctor/rewardsPictures")
      )
    );

    console.log("Cloudinary URLs:", urls);

    // Update coverPages of each publication
    doctor.rewards.forEach((reward, index) => {
      doctor.rewards[index].pictures = [
        ...(reward.pictures|| []),
        ...urls.map((urlData) => ({
          url: urlData.secure_url,
          public_id: urlData.public_id,
        })),
      ];
    });

    // Save the updated doctor document
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Reward Pictures uploaded successfully",
      certificates: urls,
    });
  } catch (error: any) {
    console.error("Upload error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /doctor/:id/publication/:pubIndex/coverpage/:imgIndex




export const updateRewardPicture = async (req: Request, res: Response) => {
  try {
    const { doctorId, rewIndex, imgIndex } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    const reward = doctor.rewards[parseInt(rewIndex)];
    if (!reward || !reward.pictures[parseInt(imgIndex)]) {
      return res
        .status(404)
        .json({ success: false, message: "Picture not found" });
    }

    // Delete old image
    const oldImg = reward.pictures[parseInt(imgIndex)];
    await deleteFromCloudinary(oldImg.public_id);

    // Upload new image (streaming)
    const newImg = await streamUploadToCloudinary(
      file,
      "doctor/rewards-pictures"
    );

    // Update MongoDB
    reward.pictures[parseInt(imgIndex)] = {
      url: newImg.secure_url,
      public_id: newImg.public_id,
    };

    await doctor.save();
    return res.status(200).json({ success: true, message: "Picture updated" });
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /doctor/:id/publication/:pubIndex/coverpage/:imgIndex
export const deleteRewardPicture = async (req: Request, res: Response) => {
  try {
    const { doctorId, rewIndex, imgIndex } = req.params;

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    const reward = doctor.rewards[parseInt(rewIndex)];
    if (!reward|| !reward.pictures[parseInt(imgIndex)]) {
      return res
        .status(404)
        .json({ success: false, message: "Pictures not found" });
    }

    const imageToDelete = reward.pictures[parseInt(imgIndex)];

    // Delete from Cloudinary
    await deleteFromCloudinary(imageToDelete.public_id);

    // Remove from MongoDB
   reward.pictures.splice(parseInt(imgIndex), 1);

    await doctor.save();
    return res
      .status(200)
      .json({ success: true, message: "Picture deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};







export const uploadDoctorCertificates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const doctorId = req.params.id; // Get doctor id from route params

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    // 1. Upload files to Cloudinary
    const certificateUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, "doctor/certificates"))
    );

    // 2. Find Doctor
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // 3. Push certificates into qualifications array
    doctor.qualifications.forEach((qualification) => {
      if (!qualification.certificate) {
        qualification.certificate = [];
      }
      qualification.certificate.push(...certificateUrls);
    });

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Certificates uploaded successfully",
      data: certificateUrls,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};




export const messagess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`accountSid: ${process.env.accountSid}`);
    console.log(`authToken: ${process.env.authToken}`);

    const client = twilio(process.env.accountSid, process.env.authToken);

    const message = await client.messages.create({
      body: "Congratulations Rahul, you have been selected!", // Use full sentence
      from: "whatsapp:+14155238886", // Twilio sandbox number
      to: "whatsapp:+919027948867", // Your WhatsApp number
    });

    console.log("Message SID:", message.sid);
    console.log("Message Status:", message.status);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      sid: message.sid, // ✅ Only send SID string
      status: message.status, // ✅ Also return status
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};



















































export const trackMessageStatus = async (req: Request, res: Response) => {
  try {
    const { sid } = req.params; // Get Message SID from URL parameter

    const client = twilio(process.env.accountSid, process.env.authToken);

    const message = await client.messages(sid).fetch();

    res.status(200).json({
      success: true,
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      dateSent: message.dateSent,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};
