import mongoose, { Document, Schema, Types } from "mongoose";

//services interface

export interface IClinicServices {
  userId: mongoose.Types.ObjectId;
  category: string;
  serviceName: string;
  description?: string;
  modes: string[];
  homeServicePrice:number;
  hybridServicePrice:number;
  e_clinicServicePrice:number;
  onlineServicePrice: number;
  offlineServicePrice?: number;

  image?: [{
    url: string;
    public_id: string;
  }];

  reviews?: IReview[];
  socialLink?: ISocialLink[];
  isAvailable?: boolean;
  lead?: boolean;
  location?: {
    type: "Point";
    coordinates?: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address: string;
    landmark: string;
  };
  serviceType?: string; // e.g., "Consultation", "Surgery", etc.
}

//review interface
export interface IReview {
  userId: mongoose.Types.ObjectId;
  userType: "Patient" | "Doctor";
  rating: number;
  comment?: string;
  createdAt?: Date;
}

//social paltform interface
export interface ISocialLink {
  platform: string;
  url: string;
}



//review Schema
export const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "User",
  },
  userType: { type: String, required: true, enum: ["Patient", "Doctor"] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

//socialLinkSchema
export const socialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const clinicServiceSchema = new Schema<IClinicServices>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please select Category"],
    },
    serviceName: {
      type: String,
      required: [true, "please enter a service name"],
    },
    onlineServicePrice: {
      type: Number,
      
    },
    offlineServicePrice: {
      type: Number,
    },
    image: [{
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    }],
    modes: [
      {
        type: String,
      },
    ],
    homeServicePrice: {
      type: Number,
    },
    hybridServicePrice:{
        type:Number,

    },
    e_clinicServicePrice:{
        type:Number,
    },
    description: {
      type: String,
    },

    reviews: ReviewSchema,
    socialLink: socialLinkSchema,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lead: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] },
      city: String,
      state: String,
      pincode: String,
      address: String,
      landmark: String,
    },
    serviceType: {
      type: String,
      default: "e_clinic",
    },
  },
  { timestamps: true }
);

clinicServiceSchema.index({ location: "2dsphere" });
export const E_ClinicService = mongoose.model<IClinicServices>(
  "E_ClinicService",
 clinicServiceSchema
);
