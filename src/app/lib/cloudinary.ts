import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Upload a single file
export async function uploadFile(file: File | Buffer, folder = "chat_files") {
  // For browser File objects, you need to use FormData in the frontend API route
  // This function is mostly for server-side uploads (Node.js)
  return new Promise<string>((resolve, reject) => {
    const uploadOptions: any = { folder };

    if (file instanceof Buffer) {
      cloudinary.uploader
        .upload_stream(uploadOptions, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result.secure_url);
        })
        .end(file);
    } else {
      reject(new Error("Use this function in backend with Buffer"));
    }
  });
}

export { cloudinary };
