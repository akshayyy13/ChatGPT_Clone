// app/api/files/sign/route.ts
import { cloudinary } from "@/app/lib/cloudinary";

export async function GET() {
  const ts = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {},
    process.env.CLOUDINARY_API_SECRET!
  );
  return Response.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp: ts,
    signature,
  });
}
