import mongoose, { Schema, Document } from "mongoose";

export type CallStatus = "missed" | "completed" | "ongoing";

export interface ICall extends Document {
  caller: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: CallStatus;
}

const callSchema = new Schema<ICall>(
  {
    caller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: {
      type: String,
      enum: ["missed", "completed", "ongoing"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

export const CallModel = mongoose.model<ICall>("Call", callSchema);
