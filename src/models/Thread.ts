// src/models/Thread.ts
import { Schema, model, models } from "mongoose";

const ThreadSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "" }, // chat topic or summary text
    model: { type: String, default: "gemini-1.5" },
    settings: { type: Object, default: {} },
  },
  { timestamps: true }
);

ThreadSchema.index({ userId: 1, updatedAt: -1 });

export const Thread = models.Thread || model("Thread", ThreadSchema);