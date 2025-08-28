// src/models/User.ts
import { Schema, model, models } from "mongoose";

// User schema with optional profile image URL
const UserSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    image: { type: String }, // profile photo URL or null
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
