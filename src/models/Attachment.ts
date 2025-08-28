// models/Attachment.ts
import { Schema, model, models } from "mongoose";
const AttachmentSchema = new Schema(
  {
    url: String,
    publicId: String,
    mime: String,
    name: String,
    size: Number,
    metadata: Object,
  },
  { timestamps: true }
);

export const Attachment =
  models.Attachment || model("Attachment", AttachmentSchema);
