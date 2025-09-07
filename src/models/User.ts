import { Schema, model, models, Document, ObjectId } from "mongoose";

export interface IUser extends Document {
  _id: ObjectId;
  name?: string;
  email: string;
  passwordHash?: string;
  image?: string;
  emailVerified: boolean;
  provider: "credentials" | "google";
  birthday?: string; // ✅ Add birthday field
  profileCompleted?: boolean; // ✅ Add profile completion flag
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    birthday: { type: String }, // ✅ Add birthday field
    profileCompleted: { type: Boolean, default: false }, // ✅ Add profile completion flag
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
