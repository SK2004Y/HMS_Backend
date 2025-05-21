import mongoose, { Document, Schema } from "mongoose";

// Interfaces for the models
export interface IServiceOffered {
  name: string;
  rate: number;
  discount: number;
  remark?: string;
  picture: string[];
  videolink?: string;
}

export interface ISocialEvent {
  title: string;
  date: Date;
  description?: string;
}

export interface ISocialInteraction {
  camps: ISocialEvent[];
  awareness: ISocialEvent[];
  programs: ISocialEvent[];
  outreach: ISocialEvent[];
  donations: ISocialEvent[];
  images: string[];
}

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface IClinic extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  bio?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address: string;
    landmark: string;
  };
  isApproved: boolean;
  onlineStatus: boolean;
  status: "active" | "inactive";
  charge: number;
  chargeoffer?: number;
  socketId: string;  //optinal
  socialLinks?: ISocialLink[];
  reviews?: string[];
  doctor?: mongoose.Types.ObjectId[];
  servicesOffered?: IServiceOffered[];
  socialInteraction?: ISocialInteraction;
}


const clinicReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "reviews.userType",
  },
  userType: { type: String, required: true, enum: ["Patient", "Doctor"] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const socialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const serviceOfferedSchema = new Schema<IServiceOffered>(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    remark: { type: String },
    picture: [{ type: String }],
    videolink: { type: String },
  },
  { _id: true, timestamps: true }
);



const socialEventSchema = new Schema<ISocialEvent>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
  },
  { _id: false }
);

const socialInteractionSchema = new Schema<ISocialInteraction>(
  {
    camps: [socialEventSchema],
    awareness: [socialEventSchema],
    programs: [socialEventSchema],
    outreach: [socialEventSchema],
    donations: [socialEventSchema],
    images: [String],
  },
  { _id: true, timestamps: true }
);

const clinicSchema = new Schema<IClinic>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    image: String,
    bio: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true },
      city: String,
      state: String,
      pincode: String,
      address: String,
      landmark: String,
    },
    isApproved: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: false },
    socketId: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    charge: { type: Number, required: true },
    chargeoffer: Number,
    socialLinks: [socialLinkSchema],
    reviews: [clinicReviewSchema],
    doctor: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
    servicesOffered: [serviceOfferedSchema],
    socialInteraction: socialInteractionSchema,
  },
  {
    timestamps: true,
  }
);

clinicSchema.index({ location: "2dsphere" });

export const ClinicModel = mongoose.model<IClinic>("Clinic", clinicSchema);
