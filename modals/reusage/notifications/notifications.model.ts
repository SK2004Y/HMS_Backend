import mongoose, { Schema } from "mongoose";
export interface INotification extends Document {
  receiverId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "chat" | "appointment" | "payment" | "general";
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["chat", "appointment", "payment", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
