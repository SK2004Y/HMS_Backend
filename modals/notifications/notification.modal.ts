import mongoose, { Schema } from "mongoose";

// ✅ Step 2: Notification Model - Tracks in-app/email notifications
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string; // e.g. payment, message, booking
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
