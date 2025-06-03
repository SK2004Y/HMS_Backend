import mongoose, { Schema } from "mongoose";

export interface IChat extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  seen: boolean;
}

const chatSchema = new Schema<IChat>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);
