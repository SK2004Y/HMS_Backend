import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";
import streamifier from "streamifier"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});





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





export const streamUploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string
): Promise<{ images: any[]; videos: any[] }> => {
  const images: any[] = [];
  const videos: any[] = [];

  for (const file of files) {
    const type = file.mimetype.startsWith("video") ? "video" : "image";

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: type },
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
        streamifier.createReadStream(file.buffer).pipe(upload_stream);
      }
    );

    if (type === "image") images.push(result);
    else videos.push(result);
  }

  return { images, videos };
};








export default cloudinary;
