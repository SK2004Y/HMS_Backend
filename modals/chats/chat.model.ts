import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message: string;
  seen: boolean;
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);
