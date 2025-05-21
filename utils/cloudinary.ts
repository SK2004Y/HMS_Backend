import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";
import streamifier from "streamifier"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const uploadToCloudinary = async (
//   fileBuffer: Buffer,
//   folder: string
// ) => {
//   return new Promise<{ secure_url: string; public_id: string }>(
//     (resolve, reject) => {
//       cloudinary.uploader
//         .upload_stream({ resource_type: "auto", folder }, (error, result) => {
//           if (error) return reject(error);

//           resolve({
//             secure_url: result?.secure_url ?? "",
//             public_id: result?.public_id ?? "",
//           });
//         })
//         .end(fileBuffer); // This writes the file buffer to the stream
//     }
//   );
// };

// export const deleteFromCloudinary = (public_id: string): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.destroy(public_id, (error, result) => {
//       if (error) return reject(error);
//       resolve(result);
//     });
//   });
// };

// export const uploadToCloudinary = async (
//   fileBuffer: Buffer,
//   folder: string
// ) => {
//   return new Promise<{ secure_url: string; public_id: string }>(
//     (resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { resource_type: "auto", folder },
//         (error, result) => {
//           if (error) return reject(error);
//           if (!result) return reject(new Error("Upload failed with no result"));
//           resolve({
//             secure_url: result.secure_url,
//             public_id: result.public_id,
//           });
//         }
//       );

//       // ✅ streamifier turns buffer into a readable stream and pipes to Cloudinary
//       streamifier.createReadStream(fileBuffer).pipe(uploadStream);
//     }
//   );
// };







// export const uploadToCloudinary = (
//   fileBuffer: Buffer,
//   folder: string
// ): Promise<{ secure_url: string; public_id: string }> => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: "auto",
//         timeout: 60000, // 60 seconds timeout
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           reject(error);
//         } else if (result) {
//           resolve({
//             secure_url: result.secure_url,
//             public_id: result.public_id,
//           });
//         }
//       }
//     );

//     streamifier.createReadStream(fileBuffer).pipe(stream).on("error", reject);
//   });
// };




// export const uploadToCloudinary = async (
//   fileBuffer: Buffer,
//   folder: string
// ): Promise<{ secure_url: string; public_id: string }> => {
//   const base64String = fileBuffer.toString("base64");

//   return await cloudinary.uploader.upload(
//     `data:image/jpeg;base64,${base64String}`,
//     {
//       folder,
//       resource_type: "image",
//     }
//   );
// };


// export const uploadToCloudinary = async (
//   fileBuffer: Buffer,
//   folder: string
// ) => {
//   const base64Image = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

//   try {
//     const result = await cloudinary.uploader.upload(base64Image, {
//       folder,
//       timeout: 60000, // Optional: longer timeout
//     });

//     return {
//       secure_url: result.secure_url,
//       public_id: result.public_id,
//     };
//   } catch (err: any) {
//     console.error("Cloudinary upload failed:", err);
//     throw new Error("Image upload failed");
//   }
// };



export const deleteFromCloudinary = (public_id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};




export const streamUploadToCloudinary = (
  file: Express.Multer.File,
  folder: string
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise(async (resolve, reject) => {
    const stream = await cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(error);
        }
      }
    );
     await streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

// Delete by public_id
// export const deleteFromCloudinary = async (publicId: string) => {
//   return cloudinary.v2.uploader.destroy(publicId);
// };
export default cloudinary;
