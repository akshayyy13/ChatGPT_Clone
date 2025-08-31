// src/types/database.ts
import { Document, ObjectId } from "mongoose";
import { ChatContent } from "@/app/lib/ai";

export interface IMessage extends Document {
  _id: ObjectId;
  threadId: ObjectId;
  userId: ObjectId;
  role: "user" | "assistant";
  content: ChatContent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IThread extends Document {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  modelName: string; // Renamed from 'model' to avoid conflict with Mongoose's model property
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Or alternatively, you can use a simpler approach without extending Document:
export interface MessageData {
  _id: ObjectId;
  threadId: ObjectId;
  userId: ObjectId;
  role: "user" | "assistant";
  content: ChatContent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreadData {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  model: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
