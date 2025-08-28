// models/Memory.ts
import { Schema, model, models } from "mongoose";
const MemorySchema = new Schema(
  {
    scope: { type: String, enum: ["global", "thread"], default: "thread" },
    threadId: { type: Schema.Types.ObjectId, ref: "Thread" },
    key: String,
    value: String,
  },
  { timestamps: true }
);

export const Memory = models.Memory || model("Memory", MemorySchema);
