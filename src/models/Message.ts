// src/models/Message.ts
import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: [
      {
        type: { type: String, enum: ["text", "image", "file"], required: true },
        text: { type: String },
        url: { type: String },
        mime: { type: String },
        name: { type: String },
        size: { type: Number }, // <--- new optional field
        publicId: { type: String }, // Cloudinary public ID
      },
    ],
  },
  { timestamps: true }
);

export const Message = models.Message || model("Message", MessageSchema);
