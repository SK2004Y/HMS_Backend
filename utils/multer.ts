// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "./cloudinary"; // your config file

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     return {
//       folder: "patient_reports", // folder which is stored pdf and image
//       resource_type: "auto", // auto handles both image & pdf
//       public_id: `${Date.now()}_${file.originalname}`,
//     };
//   },
// });

// export const upload = multer({ storage });



import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per file
});
