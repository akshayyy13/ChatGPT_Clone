import { Schema, model, models, Document, ObjectId } from "mongoose";

export interface IOTP extends Document {
  _id: ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const OTP = models.OTP || model<IOTP>("OTP", OTPSchema);
