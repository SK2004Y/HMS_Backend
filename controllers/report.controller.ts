require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../modals/user_model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { error } from "console";
import { send } from "process";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/user.service";
import { json } from "stream/consumers";
// import cloudinary from "cloudinary";
import { PatientModel } from "../modals/patient.model";
import cloudinary from "../utils/cloudinary";
import { DoctorModel } from "../modals/doctor.model";



//patient image and pdf upload 
export const uploadReport = CatchAsyncError(async (req, res, next) => {

  try {
    const { userId } = req.body;

    //  Check if file is uploaded
    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const fileUrl = req.file.path; // cloudinary url
    const fileName = req.file.originalname; // original file name (e.g. "report.pdf")

    const patient = await PatientModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          medicalReports: { fileUrl, fileName },
        },
      },
      { new: true }
    );

    if (!patient) {
      return next(new ErrorHandler("Patient not found", 404));
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Report uploaded successfully",
        report: patient,
      });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


export const uploadMultipleReports = CatchAsyncError(async (req, res, next) => {

  try {
    const { userId } = req.body;

    if (!req.files || !(req.files instanceof Array)) {
      return next(new ErrorHandler("No files uploaded", 400));
    }

    const uploadedReports = (req.files as Express.Multer.File[]).map(
      (file) => ({
        fileUrl: file.path,
        fileName: file.originalname,
        uploadedAt: new Date(),
      })
    );

    const patient = await PatientModel.findOneAndUpdate(
      { userId },
      { $push: { reports: { $each: uploadedReports } } },
      { new: true }
    );

    if (!patient) return next(new ErrorHandler("Patient not found", 404));

    res.status(200).json({
      success: true,
      message: "Reports uploaded successfully",
      reports: uploadedReports,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});



// upload patient report 
export const uploadPatientReport = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const reportEntry = {
      url: req.file.path,
      type: req.file.mimetype,
      uploadedAt: new Date(),
    };

    const patient = await PatientModel.findByIdAndUpdate(
      patientId,
      { $push: { reports: reportEntry } },
      { new: true }
    );

    if (!patient) return next(new ErrorHandler("Patient not found", 404));

    res.status(200).json({
      success: true,
      message: "Report uploaded successfully",
      report: reportEntry,
    });
  }
);



// GET: /api/vs/patient/reports/:patientId
export const getAllReports = CatchAsyncError(async (req, res, next) => {
  const { patientId } = req.params;

  const patient = await PatientModel.findById(patientId);
  if (!patient) return next(new ErrorHandler("Patient not found", 404));

  res.status(200).json({
    success: true,
    reports: patient.reports,
  });
});

// GET: /api/vs/patient/report-history/:patientId
export const getReportHistory = CatchAsyncError(async (req, res, next) => {
  const { patientId } = req.params;

  const patient = await PatientModel.findById(patientId);
  if (!patient) return next(new ErrorHandler("Patient not found", 404));

  const history = [...(patient.reports || [])].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  res.status(200).json({
    success: true,
    history,
  });
});



export const deletePatientReport = CatchAsyncError(async (req, res, next) => {
  const { patientId, reportId } = req.params;

  const patient = await PatientModel.findById(patientId);
  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

 const report = patient.reports?.find((r) => r._id?.toString() === reportId);
 
  console.log(`report url is ${report?.url}`);
  if (!report || !report?.url) {
    return next(new ErrorHandler("Report URL not found", 400));
  }

  // Extract publicId from Cloudinary URL
  const fileUrl = report?.url;
  const parts = fileUrl.split("/");
  const fileNameWithExt = parts[parts.length - 1];
  const publicId = fileNameWithExt.split(".")[0];

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(`patient_reports/${publicId}`, {
    resource_type: "auto",
  });

  // Remove report from MongoDB
  patient.reports = patient.reports?.filter(
    (r) => r._id.toString() !== reportId
  );
  await patient.save();

  res.status(200).json({
    success: true,
    message: "Report deleted successfully",
  });
});




//doctor files uploaded handlers 
//patient image and pdf upload 
export const uploadReports = CatchAsyncError(async (req, res, next) => {

  try {
    const { userId } = req.body;

    //  Check if file is uploaded
    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const fileUrl = req.file.path; // cloudinary url
    const fileName = req.file.originalname; // original file name (e.g. "report.pdf")

    const doctor = await DoctorModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          medicalReports: { fileUrl, fileName },
        },
      },
      { new: true }
    );

    if (!doctor) {
      return next(new ErrorHandler("Doctor not found", 404));
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Report uploaded successfully",
        report: doctor,
      });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


