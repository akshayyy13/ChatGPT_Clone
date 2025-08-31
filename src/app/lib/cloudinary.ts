import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Upload a single file
export async function uploadFile(
  file: File | Buffer,
  folder = "chat_files"
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const uploadOptions: UploadApiOptions = { folder };

    if (file instanceof Buffer) {
      cloudinary.uploader
        .upload_stream(
          uploadOptions,
          (error, result: UploadApiResponse | undefined) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          }
        )
        .end(file);
    } else {
      reject(new Error("Use this function in backend with Buffer"));
    }
  });
}

export { cloudinary };
