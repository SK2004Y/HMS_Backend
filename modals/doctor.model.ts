import mongoose, { Schema, Document, Types } from "mongoose";

// -------------------------
// Sub-schema: Services
// -------------------------
const serviceSchema = new Schema(
  {
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    // Image object
    picture: {
      url: { type: String, required: true }, // Image URL (e.g., Cloudinary secure_url)
      public_id: { type: String, required: true }, // For deletion/modification
    },
  },
  { _id: false }
);

// -------------------------
// Sub-schema: Profile Completion
// -------------------------
const doctorProfileCompletionSchema = new Schema(
  {
    isBasicDetailsFilled: { type: Boolean, default: false },
    isLocationFilled: { type: Boolean, default: false },
    isServiceFilled: { type: Boolean, default: false },
    isBankDetailsFilled: { type: Boolean, default: false },
  },
  { _id: false }
);

// -------------------------
// Main Doctor Schema
// -------------------------
interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  profilePicture?: string;
  services: Types.DocumentArray<any>;
  doctorProfileCompletion: {
    isBasicDetailsFilled: boolean;
    isLocationFilled: boolean;
    isServiceFilled: boolean;
    isBankDetailsFilled: boolean;
  };
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profilePicture: { type: String },

    services: {
      type: [serviceSchema],
      default: [],
    },

    doctorProfileCompletion: {
      type: doctorProfileCompletionSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDoctor>("Doctor", doctorSchema);
